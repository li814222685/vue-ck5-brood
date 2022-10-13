<template>
  <div>
    <div id="editor">
      <simpleBox>
        <simpleBoxTitle>
          <simpleBoxDescription></simpleBoxDescription>
          <simpleBoxDescription></simpleBoxDescription>
        </simpleBoxTitle>
      </simpleBox>
      <p>Life is like a boat：</p>
      <span>
        Input ur Name：
        <span class="restricted-editing-exception">Lee</span>
      </span>
      <p>
        ur Age:
        <span class="restricted-editing-exception">0</span>
      </p>
    </div>
    <button v-on:click="getDom">getDom</button>
    <select v-on:change="onchangeSelect" name="" id="">
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
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
import FormControls from "@/plugins/formControls/formControls";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Link from "@ckeditor/ckeditor5-link/src/link";
import RestrictedEditingMode from "@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode";
import { getMarkerAtPosition } from "@/plugins/other/restrictededitingmode/utils.js";
import { replace } from "@ckeditor/ckeditor5-utils/src/elementreplacer";
import { ClickObserver } from "@ckeditor/ckeditor5-engine";
import { Observer } from "@ckeditor/ckeditor5-engine/src/view/observer/observer";
import { createSimpleBox, createSimpleBox2 } from "@/plugins/formControls/insertsimpleboxcommand";
// import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
const HIDDEN_CLASS = "hidden-item";
const HIGHLIGHT_CLASS = "restricted-editing-exception_selected";
const EDITABLE_CLASS = "restricted-editing-exception";

export default {
  data() {
    return {
      editor: {},
      anchor: null,
      deposit: {
        viewElement: null,
        range: null,
      },
    };
  },
  mounted() {
    // this.listenToSelectAttr();
    // 注册点击事件监听
    window.addEventListener("mousedown", this.onGlobalClick);
    ClassicEditor.create(document.querySelector("#editor"), {
      plugins: [Heading, Essentials, Bold, Italic, Paragraph, Link, RestrictedEditingMode, FormControls],
      restrictedEditing: {
        allowedCommands: ["bold", "simpleBox", "heading", "insertSimpleBox"],
        allowedAttributes: ["bold", "simpleBox", "heading", "class"],
      },
      toolbar: ["heading", "|", "bold", "italic", "link", "numberedList", "bulletedList", "|", "abbreviation", "abbreviations", "bubble", "simpleBox", "restrictedEditing"],
      htmlSupport: {
        allow: [
          {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: true,
          },
        ],
      },
    })
      .then(editor => {
        //编辑器实例挂载到 Window
        window.editor = editor;
      })
      .catch(error => {
        console.error(error.stack);
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
        const { model } = editor;

        const clickDom = document.elementFromPoint(e.clientX, e.clientY);
        const isSelected = Array.from(clickDom.classList).includes(EDITABLE_CLASS);
        // 点击可编辑区域时候执行
        if (isSelected) {
          console.log("又又");
          const modelSelection = model.document.selection;
          console.log(modelSelection.anchor);
          const marker = getMarkerAtPosition(editor, modelSelection.anchor);
          if (!marker) return;
          //Todo: 替换完毕后 控件的聚焦
          const itemRange = marker.getRange();
          const itemEnd = marker.getEnd();
          // replace编辑器指定位置的DOM
          new Promise(res => {
            model.change(writer => {
              const struct = createSimpleBox(writer);
              const range = model.insertObject(struct, itemRange);
              console.log(itemRange);
              //缓存将要移除的marker 和 当前的range
              const [viewElement] = [...editor.editing.mapper.markerNameToElements(marker.name)];
              this.deposit = _.cloneDeep({
                viewElement,
                range,
              });
              const name = marker.name;
              writer.removeMarker(marker);
              // writer.addMarker(name, { range, usingOperation: true });
              res();
            });
          }).then(res => {
            const select = document.querySelector(".simple-box-title");
            select.onchange = this.onSelectChange;
          });
        }
      }, 1);
    },
    /**
     * @desc select onchange callBack
     */
    onSelectChange() {
      const { model, editing } = window.editor;
      const view = editing.view;

      const select = document.querySelector(".simple-box-title");
      const box = document.querySelector(".simple-box");

      const { viewElement: oldViewElement, range: oldRange } = toRaw(this.deposit);
      console.log(select);
      const value = select.options[select.selectedIndex].value;

      const newSpan = document.createElement("span");
      newSpan.innerHTML = value;
      newSpan.class = "restricted-editing-exception restricted-editing-exception_selected";
      console.log(select.parentNode);
      box.parentNode.replaceChild(newSpan, box);

      console.log(value);
      // const marker = getMarkerAtPosition(window.editor, modelSelection.anchor);
      // model.change(writer => {
      //   writer.removeMarker(marker);
      // });
    },
  },
};
</script>
