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
    };
  },
  mounted() {
    // 注册点击事件监听
    console.log(this.htmlData);
    window.addEventListener("mousedown", this.onGlobalClick);
    ClassicEditor.create(document.querySelector("#editor"), RESTRICT_CONFIG)
      .then(editor => {
        CKEditorInspector.attach(editor);

        //编辑器实例挂载到 Window
        window.editor = editor;
        editor.setData(this.htmlData);
      })
      .catch(error => {});
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
      //todo ：如果是dom祖先里面有SECTION那就展示菜单
      if (hasSection || isSectionBtn) {
        this.menuVisible = true;
        this.attributsList = [
          { key: "type", value: sectionDom.getAttribute("type") },
          { key: "data-cases", value: sectionDom.getAttribute("data-cases") },
          { key: "modelname", value: sectionDom.getAttribute("modelname") },
        ];
      } else {
        this.positionRange = [];
        this.menuVisible = false;
      }
      if (sectionDom) {
        const sectionPostion = sectionDom.getBoundingClientRect();
        const [sectionMenuPostionX, sectionMenuPostionY] = [Math.floor(sectionPostion.x), Math.floor(sectionPostion.y)];
        //todo： 根据这个去显示菜单
        this.positionRange = [sectionMenuPostionX, sectionMenuPostionY];
      }
    },
    changeCase(val) {
      const editor = window.editor;
      const { model, editing } = editor;
      const casesList = {
        caseA: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名"type="switch" data-cases="["caseA","caseB","caseC"]" role="textbox" contenteditable="true"><p>我只是一个段落</p><span class="restricted-editing-exception">只是一个可编辑的地方</span></section>`,
        caseB: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名"type="switch" data-cases="["caseA","caseB","caseC"]" role="textbox" contenteditable="true"><p>CASE B</p></section>`,
        caseC: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名"
        type="switch" data-cases="["caseA","caseB","caseC"]" role="textbox" contenteditable="true">
        <span class="restricted-editing-exception">只是一个可编辑的地方</span></section>`,
      };
      const sectionVal = casesList[val];

      model.change(writer => {
        const editorData = editor.getData();
        console.log(editorData)
        // let editorGroup = editorData.split("section");
        // let caseGroup = sectionVal.split("section");
        // let newGroup = [editorGroup[0], caseGroup[1], editorGroup[2]];
        // let newEditorData = newGroup.join("section");
        console.log(casesList.caseA,sectionVal)
        const newVal = _.replace(editorData,'模块名','leehaohaohao')
        console.log(newVal)
        editor.setData(newVal);
      });
      console.log(val, sectionVal, "changeCase");
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
        console.log(this.nowMode);
        return this.nowMode;
      }
    },
  },
  watch: {
    htmlData: {
      immediate: true,
      handler(val) {
        console.log(window.editor);
        if (window.editor) {
          window.editor.setData(val);
        }
      },
    },
  },
};
</script>
