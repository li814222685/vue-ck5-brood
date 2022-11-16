<template>
  <div>
    <div id="editor"></div>
    <SectionMenu :position-range="positionRange" :attributs-list="attributsList" :menu-visible="menuVisible" @changeCase="changeCase" />
  </div>
</template>

<script>
import { toRaw } from "vue";
import _ from "lodash";
import { toShowSectionMenu, changeCaseValue, setMarker } from "../../plugins/section/sectionMenu.ts";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { getMarkerAtPosition } from "@/plugins/formControls/utils.js";
import { RESTRICT_CONFIG } from "./config.js";
import { regExpReplacer, removeClass, removeElement } from "../utils";
import { EditorClasses } from "./define";
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import SectionMenu from "./SectionMenu/index";
import { parse, stringify } from "himalaya";
import { V_SECTION, V_SPAN } from "../../plugins/section/constant.ts";
import "../../plugins/theme/style-setion.css"

const { HIDDEN_CLASS, EDITABLE_CLASS, V_SELECT } = EditorClasses;

export default {
  props: ["htmlData", "sectionData", "nowMode", "onchange"],
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
        const isControlSelect = Array.from(clickDom.classList).includes("control-select");
        if (isControlSelect) {
          // const modelSelection = model.document.selection;
          // const firstRange = modelSelection.getFirstPosition();
          // const LastRange = modelSelection.getLastPosition();
          // let element = model.schema.getLimitElement(elementRange);
          // console.log(modelSelection, firstRange, LastRange);
        }
        toShowSectionMenu(clickDom, this);
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
    /**
     * @description 获取caseName,找到case结构进行section替换
     * @param caseName caseName
     * @param currentCase 当前case
     */
    changeCase(caseName, currentCase) {
      changeCaseValue(caseName, currentCase, toRaw(this.sectionData), this);
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
<style scoped>
.hidden-item {
  display: none;
}
.extendBackground {
  background-color: rgba(255, 169, 77, 0.2) !important;
}
</style>