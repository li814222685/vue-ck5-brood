<template>
  <div>
    <div id="editor"></div>
    <SectionMenu :position-range="positionRange" :attributs-list="attributsList" :menu-visible="menuVisible" @changeCase="changeCase" />
  </div>
</template>
<style>
.hidden-item {
  display: none;
}
.extendBackground {
  background-color: rgba(255, 169, 77, 0.2) !important;
}
</style>

<script>
import { toRaw } from "vue";
import _ from "lodash";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { getMarkerAtPosition } from "@/plugins/formControls/utils.js";
import { RESTRICT_CONFIG } from "./config.js";
import { regExpReplacer, removeClass, removeElement } from "../utils";
import { EditorClasses } from "./define";
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import SectionMenu from "./SectionMenu/index";
import { parse, stringify } from "himalaya";
import { V_SECTION, V_SPAN } from "../../plugins/section/constant.ts";

const { HIDDEN_CLASS, EDITABLE_CLASS, V_SELECT } = EditorClasses;

export default {
  props: ["htmlData", "nowMode", "onchange"],
  components: { SectionMenu },
  data() {
    return {
      editor: {},
      anchor: null,
      deposit: {
        oldViewElement: null,
        //v-select的range区间
        newRange: null,
        oldMarker: null,
        dom: null,
      },
      menuVisible: false,
      positionRange: [],
      attributsList: [],
      range: null,
      clickDom: null,
      spanRanges: [],
    };
  },
  mounted() {
    // 注册点击事件监听
    window.addEventListener("mousedown", this.onGlobalClick);
    ClassicEditor.create(document.querySelector("#editor"), RESTRICT_CONFIG)
      .then(editor => {
        CKEditorInspector.attach(editor);
        //编辑器实例挂载到 Window
        window.editor = editor;
        console.log(this.htmlData);
        editor.setData(this.htmlData);
      })
      .catch(error => {
        console.error(error);
      });
  },
  methods: {
    /**
     * @description 全局点击事件
     * @param {event} e
     */
    onGlobalClick(e) {
      setTimeout(() => {
        const editor = window.editor;
        const { model, editing } = editor;
        const clickDom = document.elementFromPoint(e.clientX, e.clientY);
        this.toShowSectionMenu(clickDom, editor);
        this.toShowSelect(clickDom, editor);
      }, 1);
    },
    /**
     * @desc select onchange callBack
     */
    onSelectChange() {
      const editor = window.editor;
      const { model, editing } = editor;
      const { oldViewElement, newRange, oldMarker } = toRaw(this.deposit);
      const select = document.querySelector(V_SELECT);
      const value = select.options[select.selectedIndex].value;
      const range = oldMarker.getRange();
      model.change(writer => {
        //移除vselect
        select.blur();
        const text = writer.createText(value, oldViewElement.getAttributes());
        model.insertContent(text, range);
      });
    },
    onSelectBlur() {
      const { oldViewElement, newRange } = toRaw(this.deposit);
      removeClass(HIDDEN_CLASS, oldViewElement);
      removeElement(newRange);
      //reset 缓存
      this.deposit = {
        oldViewElement: null,
        newRange: null,
        oldMarker: null,
        dom: null,
      };
    },
    exportData() {
      this.onchange(window.editor.getData());
    },
    getDomPath(ele) {
      let path = ele.nodeName;
      let parent = ele.parentNode;
      while (parent) {
        path = parent.nodeName + "/" + path;
        parent = parent.parentNode;
      }
      return path;
    },
    //Section Menu展示逻辑
    toShowSectionMenu(clickDom, editor) {
      const domAncestorsPath = this.getDomPath(clickDom);
      const tagName = clickDom.tagName;
      const classList = clickDom.classList;
      const isSelected = Array.from(clickDom.classList).includes("visual-select");
      // tagname 是svg/path classname 有section-btn / section-menu
      const isSectionBtn = tagName == "svg" || tagName == "path" || Array.from(classList).includes("section-btn") || Array.from(classList).includes("section-menu");
      const hasSection = domAncestorsPath.split("/").includes("SECTION");
      const sectionDom = document.querySelector(".ck-editor__nested-editable_focused");
      // 清空位置
      this.positionRange = [];
      this.menuVisible = false;
      //todo ：如果是dom祖先里面有SECTION or tagname 是 svg/path classname 有 section-btn/section-menu 那就展示菜单
      if (hasSection || isSectionBtn) {
        this.menuVisible = true;
      } else {
        this.positionRange = [];
        this.menuVisible = false;
      }
      if (sectionDom) {
        this.attributsList = [
          { key: "type", value: sectionDom.getAttribute("type") },
          { key: "data-cases", value: sectionDom.getAttribute("data-cases") },
          { key: "modelname", value: sectionDom.getAttribute("modelname") },
        ];
        const sectionPostion = sectionDom.getBoundingClientRect();
        const [sectionMenuPostionX, sectionMenuPostionY] = [Math.floor(sectionPostion.x), Math.floor(sectionPostion.y)];
        //todo： 根据这个去显示菜单
        this.positionRange = [sectionMenuPostionX, sectionMenuPostionY];
      }
    },
    /**
     * @description 获取caseName,找到case结构进行section替换
     * @param val caseName
     */
    changeCase(caseName) {
      const editor = window.editor;
      const { model, editing } = editor;
      const view = editing.view;
      const modelSelection = model.document.selection;
      const casesList = {
        caseA: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC"]" role="textbox" contenteditable="true"><p>我只是一个段落</p><span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方</span></section>`,
        caseB: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC"]" role="textbox" contenteditable="true"><p>CASE B</p></section></p>`,
        caseC: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC"]" role="textbox" contenteditable="true"><span class="restricted-editing-exception restricted-editing-exception_collapsed">怎么才能可编辑</span><p>CASE C</p><span class="restricted-editing-exception restricted-editing-exception_collapsed">怎么才能可编辑2</span></section>`,
      };
      const sectionVal = casesList[caseName];
      // editor.setData(sectionVal);
      // 获取html标签字符串转换的对象
      const parserSection = parse(sectionVal);
      let range = null;
      const firstRange = modelSelection.getFirstPosition();
      const LastRange = modelSelection.getLastPosition();
      const markers = model.markers;
      model.change(writer => {
        // 获取section范围
        // 通过section 范围获取到范围内的 element
        const elementRange = writer.createRange(firstRange, LastRange);
        const element = model.schema.getLimitElement(elementRange);
        range = writer.createRangeOn(element);
        const markerList = Array.from(markers.getMarkersIntersectingRange(range))
        // 删除移除范围内的所有marker
        markerList.map(marker => writer.removeMarker(marker.name))
        // 移除范围和范围内元素，再去插入
        writer.remove(range);
        // 创建新的element，插入
        const newElement = this.createSectionInner(writer, parserSection, null);
        model.insertContent(newElement, range);
        console.log(markers);
      });
    },
    /**
     * @description 创建section内的元素
     * @param writer model 编写器
     * @param parserDom 元素结构转化的对象
     * @param parentElement 父级元素
     */
    createSectionInner(writer, parserDom, parentElement) {
      let elementList = [],
        text = null,
        dom = null;
      for (let item of parserDom) {
        text = "";
        dom = "";
        if (item.type === "element" && item.tagName !== "span") {
          // 返回元素属性对象
          let atttibutesList = item.attributes.map(item => [item.key, item.value]);
          atttibutesList = Object.fromEntries([...atttibutesList]);
          // 创建元素
          if (item.tagName === "section") {
            dom = writer.createElement(V_SECTION, atttibutesList);
          } else if (item.tagName === "p") {
            dom = writer.createElement("paragraph", atttibutesList);
          } else {
            dom = writer.createElement(item.tagName, atttibutesList);
          }
          // 插入到父级元素
          if (parentElement) {
            writer.append(dom, parentElement);
          }
        } else {
          // span 和元素內的文字需要创建文字插入到dom中
          if (item.tagName && item.tagName === "span") {
            for (let i of item.children) {
              text += i.content;
            }
            const word = writer.createText(text);
            writer.append(word, parentElement);
            this.$nextTick(() => {
              const range = writer.createRangeOn(word);
              this.spanRanges = range;
              const { model } = editor;
              model.change(writer => {
                const ranges = toRaw(this.spanRanges);
                // 添加可编辑的 marker，进行 markertohighlight 的下行转换
                const markerName = `restrictedEditingException:` + (Array.from(model.markers).length + 1);
                writer.addMarker(markerName, { range: ranges, usingOperation: true });
              });
            });
          } else if (parentElement) {
            const word = writer.createText(item.content);
            writer.append(word, parentElement);
          }
        }
        // 递归
        if (item.children) {
          this.createSectionInner(writer, item.children, dom);
        }
      }
      return dom;
    },
    //v-select 相关的展示逻辑
    toShowSelect(clickDom, editor) {
      const { model, editing } = editor;
      const modelSelection = model.document.selection;
      const isSelected = Array.from(clickDom.classList).includes("visual-select");

      // 点击可编辑区域时候执行
      if (isSelected) {
        const modelSelection = model.document.selection;

        const marker = getMarkerAtPosition(editor, modelSelection.anchor);
        return;
        if (!marker) return;
        const itemEnd = marker.getEnd();
        // replace编辑器指定位置的DOM
        new Promise(res => {
          editing.view.change(writer => {
            const newRange = editor.execute("insertSimpleBox", itemEnd);
            //缓存将要移除的marker 和 当前的range
            const [oldViewElement] = [...editor.editing.mapper.markerNameToElements(marker.name)];
            this.deposit = {
              oldViewElement,
              dom: clickDom,
              newRange,
              oldMarker: marker,
            };
            writer.addClass(HIDDEN_CLASS, oldViewElement);
            res();
          });
        }).then(res => {
          const select = document.querySelector(V_SELECT);
          const textNode = document.querySelector(".hidden-item");
          select.focus();
          select.value = textNode.innerText;
          select.onblur = this.onSelectBlur;
          select.onchange = this.onSelectChange;
        });
      }
    },
  },
  computed: {
    nowMode() {
      if (this.nowMode) {
        return this.nowMode;
      }
    },
  },
  watch: {
    htmlData: {
      immediate: true,
      handler(val) {
        if (window.editor) {
          console.log(val, "data");
          window.editor.setData(val);
        }
      },
    },
  },
};
</script>
