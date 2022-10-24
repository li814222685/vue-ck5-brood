<template>
  <div>
    <el-button type="primary" @click="exportData" plain>导出</el-button>
    <div id="editor"></div>
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
import { createSimpleBox } from "@/plugins/formControls/insertsimpleboxcommand";
import { V_SELECT } from "../../plugins/controlsMenu/constant.ts";

const { HIDDEN_CLASS, EDITABLE_CLASS, V_SELECT_CLASS } = EditorClasses;

export default {
  props: ["htmlData", "nowMode", "onchange"],

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
        console.log(clickDom.classList);
        const isSelected = Array.from(clickDom.classList).includes(V_SELECT);
        // 点击可编辑区域时候执行
        if (isSelected) {
          const modelSelection = model.document.selection;
          const marker = getMarkerAtPosition(editor, modelSelection.anchor);
          if (!marker) return;
          const itemEnd = marker.getEnd();
          console.log(itemEnd);
          // replace编辑器指定位置的DOM
          new Promise(res => {
            editing.view.change(writer => {
              const newRange = editor.execute("insertSimpleBox", itemEnd);
              model.change(downcastWriter => {
                const range = model.insertObject(createSimpleBox(downcastWriter), itemEnd);
                console.log("9999:", range);
              });
              console.log(
                "%c🍉Lee%cline:79%cNewRange",
                "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
                "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
                "color:#fff;background:rgb(248, 214, 110);padding:3px;border-radius:2px",
                "执行后"
              );
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
            const select = document.querySelector(V_SELECT_CLASS);
            const textNode = document.querySelector(".hidden-item");
            select.focus();
            select.value = textNode.innerText;
            select.onblur = this.onSelectBlur;
            select.onchange = this.onSelectChange;
          });
        }
      }, 1);
    },
    /**
     * @desc select onchange callBack
     */
    onSelectChange() {
      const editor = window.editor;
      const { model, editing } = editor;
      const { oldViewElement, newRange, oldMarker } = toRaw(this.deposit);
      const select = document.querySelector(V_SELECT_CLASS);
      const value = select.options[select.selectedIndex].value;
      const range = oldMarker.getRange();

      model.change(writer => {
        //移除vselect
        select.blur();
        const text = writer.createText(value, oldViewElement.getAttributes());
        console.log(text);
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
      this.onchange(window.devEditor.getData());
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
