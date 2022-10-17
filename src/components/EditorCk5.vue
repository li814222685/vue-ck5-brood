<template>
  <div>
    <div id="editor">
      <simpleBox>
        <simpleBoxTitle>
          <simpleBoxDescription></simpleBoxDescription>
          <simpleBoxDescription></simpleBoxDescription>
        </simpleBoxTitle>
      </simpleBox>
      <p class="adc">Life is like a boat：</p>
      <span>
        Input ur Name：
        <span class="restricted-editing-exception">李浩</span>
      </span>
      <p>
        ur Age:
        <span class="restricted-editing-exception">0</span>
      </p>
    </div>
    <button v-on:click="getDom">getDom</button>
    <select v-on:change="onchangeSelect" name="" id="" value="3">
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
import { ElementReplacer } from "@ckeditor/ckeditor5-utils/src/elementreplacer";
import { ClickObserver } from "@ckeditor/ckeditor5-engine";
import { Observer } from "@ckeditor/ckeditor5-engine/src/view/observer/observer";
import { createSimpleBox, createSpan } from "@/plugins/formControls/insertsimpleboxcommand";
import getDataFromElement from "@ckeditor/ckeditor5-utils/src/dom/getdatafromelement";
import { setData } from "@ckeditor/ckeditor5-engine/src/dev-utils/view";
import MarkerCollection from "@ckeditor/ckeditor5-engine/src/model/markercollection";

// import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
const HIDDEN_CLASS = "hidden-item";
const HIGHLIGHT_CLASS = "restricted-editing-exception_selected";
const EDITABLE_CLASS = "restricted-editing-exception";
const V_SELECT = ".virtual-select";

export default {
  data() {
    return {
      editor: {},
      anchor: null,
      deposit: {
        viewElement: null,
        range: null,
        marker: null,
        dom: null,
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
        const { model, editing } = editor;

        const clickDom = document.elementFromPoint(e.clientX, e.clientY);
        console.log(clickDom);
        const isSelected = Array.from(clickDom.classList).includes(EDITABLE_CLASS);
        // 点击可编辑区域时候执行
        if (isSelected) {
          console.log("又又");
          const modelSelection = model.document.selection;
          console.log(modelSelection.anchor);
          const marker = getMarkerAtPosition(editor, modelSelection.anchor);
          console.log(marker);
          if (!marker) return;
          //Todo: 替换完毕后 控件的聚焦
          const itemRange = marker.getRange();
          const itemEnd = marker.getEnd();
          // replace编辑器指定位置的DOM
          new Promise(res => {
            editing.view.change(writer => {
              const range = editor.execute("insertSimpleBox", itemEnd);
              //缓存将要移除的marker 和 当前的range
              const [viewElement] = [...editor.editing.mapper.markerNameToElements(marker.name)];
              this.deposit = {
                viewElement,
                dom: clickDom,
                range,
              };
              writer.addClass(HIDDEN_CLASS, viewElement);
              res();
            });
          }).then(res => {
            const select = document.querySelector(V_SELECT);
            const textNode = document.querySelector(".hidden-item");
            console.log(textNode.innerText);
            select.value = textNode.innerText;
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
      const select = document.querySelector(V_SELECT);

      const { viewElement: oldViewElement, range: oldRange, marker: oldMarker, dom } = toRaw(this.deposit);
      const value = select.options[select.selectedIndex].value;
      //移除vselect
      model.change(writer => {
        writer.remove(oldRange);
      });
      //赋值给原本的marker span
      editing.view.change(writer => {
        //第itemIndex个 可编辑字符
        const [__, itemIndex] = oldViewElement._id.split(":");
        const data = editor.getData();
        console.log(value);
        console.log(data);
        console.log(dom.innerText);
        const oldText = dom.innerText;
        for (const marker of editor.model.markers) {
          model.change(writer => {
            writer.removeMarker(marker);
          });
        }
        const res = this.domStringReplacer(data, oldText, value, itemIndex);
        editor.setData(res);
        console.log(data);
        console.log(oldText);
        console.log(value);
        console.log(itemIndex);
        writer.removeClass(HIDDEN_CLASS, oldViewElement);
      });
    },
    /**
     * @description 替换DomString内的指定字符
     * @params str: 字符源
     * @params target:目标字符
     * @params fillText: 填充字符
     * @params idx: 第n次出现的
     */
    domStringReplacer(str, target, fillText, idx) {
      let count = 0;
      return str.replace(new RegExp(target, "g"), p => {
        count++;
        return count == idx ? fillText : target;
      });
    },
  },
};
</script>
