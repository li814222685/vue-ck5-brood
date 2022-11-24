<template>
  <div id="restrictMode">
    <el-button type="primary" @click="exportData" plain>导出</el-button>
    <div id="editor"></div>
  </div>
</template>
<style>
.hidden_item {
  display: none;
}
.extendBackground {
  background-color: inherit !important;
  min-width: 60px;
  outline: none !important;
  border: none;
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
import { emitter, SAVE_HIDDEN_ITEM, REPLACE_HIDDEN_ITEM_TEXT } from "./mitt.ts";

const { HIDDEN_CLASS, EDITABLE_CLASS, V_SELECT } = EditorClasses;

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
    window.addEventListener("mousedown", this.onGlobalClick);
    emitter.on(SAVE_HIDDEN_ITEM, this.saveCellItemAndSelectRange);
    emitter.on(REPLACE_HIDDEN_ITEM_TEXT, this.setRestrictedTextFromTableSelect);

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
        const isSelected = Array.from(clickDom.classList).includes(V_SELECT);
        // 点击可编辑区域时候执行
        if (isSelected) {
          const modelSelection = model.document.selection;
          const marker = getMarkerAtPosition(editor, modelSelection.anchor);
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
            const textNode = document.querySelector(".hidden_item");
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
      this.onchange(window.devEditor.getData());
    },

    /** 缓存隐藏的元素和TableSelect的范围 */
    saveCellItemAndSelectRange(deposit) {
      this.deposit = deposit;
    },

    /** TableSelect的值填入 可编辑文字元素 */
    setRestrictedTextFromTableSelect(val) {
      const editor = window.editor;
      const model = editor.model;
      const { oldViewElement: restoreItem, oldMarker, newRange: removeRange } = toRaw(this.deposit);
      const oldRange = oldMarker.getRange();
      removeElement(removeRange);

      //1.显示隐藏的元素
      removeClass(HIDDEN_CLASS, restoreItem);

      //2.将value 替换 元素内的文本
      model.change(writer => {
        const text = writer.createText(val, restoreItem.getAttributes());
        model.insertContent(text, oldRange);
      });
      // 3. 销毁掉Select
      this.deposit = {
        oldViewElement: null,
        newRange: null,
        oldMarker: null,
        dom: null,
      };
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
          window.editor.setData(val);
        }
      },
    },
  },
};
</script>
