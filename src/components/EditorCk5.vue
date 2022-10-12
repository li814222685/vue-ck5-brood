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
  </div>
</template>
<style>
.hidden-item {
  display: none;
}
</style>

<script>
// import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";
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
import { createSimpleBox } from "@/plugins/formControls/insertsimpleboxcommand";
// import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
const HIDDEN_CLASS = "hidden-item";
const HIGHLIGHT_CLASS = "restricted-editing-exception_selected";
const EDITABLE_CLASS = "restricted-editing-exception";
export default {
  data() {
    return {
      editor: {},
      anchor: null,
    };
  },
  mounted() {
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
        const clickDom = document.elementFromPoint(e.clientX, e.clientY);
        const isSelected = Array.from(clickDom.classList).includes(EDITABLE_CLASS);
        if (isSelected) {
          const modelSelection = window.editor.model.document.selection;
          const marker = getMarkerAtPosition(window.editor, modelSelection.anchor);
          console.log(marker);
          const itemRange = marker.getRange();
          // 改变视图
          window.editor.model.change(writer => {
            //Todo：替换掉当前点击命中元素，而不是插入
            window.editor.model.insertObject(createSimpleBox(writer), itemRange, null);
          });
          //Todo：select 选值/失焦 以后正常的文字回显示
        }
      }, 1);
    },
  },
};
</script>
