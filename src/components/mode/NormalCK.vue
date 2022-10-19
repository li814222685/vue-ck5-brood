<template>
  <div>
    <el-button type="primary" @click="getEditorData" plain>导出</el-button>
    <br />
    <div id="devEditor">
      {{ data }}
    </div>
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
import { getMarkerAtPosition } from "@/plugins/other/restrictededitingmode/utils.js";
import { NORMAL_CONFIG } from "./config.js";
import { removeClass, removeElement } from "../utils";
import { EditorClasses } from "./define";
const { HIDDEN_CLASS, EDITABLE_CLASS, V_SELECT } = EditorClasses;

export default {
  props: {
    data: String,
    nowMode: String,
  },
  data() {
    return {
      editor: {},
      anchor: null,
      deposit: {},
    };
  },
  mounted() {
    ClassicEditor.create(document.querySelector("#devEditor"), NORMAL_CONFIG)
      .then(editor => {
        //编辑器实例挂载到 Window
        window.devEditor = editor;
      })
      .catch(error => {});
  },
  methods: {
    getEditorData() {
      console.log(window.devEditor.getData());
    },
  },
  watch: {
    nowMode(newVal, oldVal) {
      if (newVal !== oldVal) {
        console.log("changed");
        onchange(window.editor.getData());
      }
    },
  },
};
</script>
