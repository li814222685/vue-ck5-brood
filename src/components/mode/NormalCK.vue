<template>
  <div>
    <JqxDropDownList :width="200" :height="25" :source="['htmlData', 'nowMode', 'onchange']" :selectedIndex="1"> </JqxDropDownList>
    <el-button type="primary" @click="exportData" plain>导出</el-button>
    <br />
    <br />

    <div id="devEditor"></div>
  </div>
  <SelectDialog :visible="dialogVisible" :change-visible="swtichModal" :table-data="selectedOptions" :insert-options-to-select="insertOptionsToSelect" />
</template>
<style scoped>
.hidden-item {
  display: none;
}
.extendBackground {
  background-color: inherit !important;
  min-width: 60px;
  outline: none !important;
}
</style>

<script lang="ts">
import _ from "lodash";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { NORMAL_CONFIG } from "./config.js";
import { emitter, SWITCH_MODAL, Option, GET_OPTIONS } from "./mitt";
import SelectDialog from "./SelectDialog/index.vue";
import { COMMAND_NAME__INSERT_OPTIONS } from "../../plugins/controlsMenu/constant";
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import { parse as toAst, stringify as toHtmlString } from "himalaya";
import JqxDropDownList from "jqwidgets-scripts/jqwidgets-vue/vue_jqxdropdownlist.vue";

export default {
  props: ["htmlData", "nowMode", "onchange"],
  data() {
    return {
      editor: {},
      anchor: null,
      deposit: {},
      dialogVisible: false,
      selectedOptions: [], //当前选中select 有哪些options，用来将options传递到弹窗表格内
      source: ["Affogato", "Americano", "Bicerin", "Breve", "Café Bombón", "Café au lait", "Caffé Corretto", "Irish coffee", "Liqueur coffee"],
    };
  },
  components: { SelectDialog, JqxDropDownList },
  mounted() {
    //挂载Emitter
    this.hangUpAllEmitFunctions();
    const color = "rgba(255,169,77,.2)";
    const style = `style="background-color:hsl(30deg 100% 94%);"`;
    ClassicEditor.create(document.querySelector("#devEditor"), NORMAL_CONFIG)
      .then(editor => {
        console.log(editor.ui);
        editor.ui.focusTracker.on("change:focusedElement", (evt, name, focusedElement) => {
          console.log(focusedElement);
        });
        CKEditorInspector.attach(editor);
        //编辑器实例挂载到 Window
        (window as any).devEditor = editor;
        editor.setData(this.htmlData);
      })
      .catch(error => {});
  },
  methods: {
    exportData() {
      this.onchange((window as any).devEditor.getData());
    },
    swtichModal() {
      this.dialogVisible = !this.dialogVisible;
      //每次关闭MODAL后都清空 Table 数据
      emitter.emit(GET_OPTIONS, []);
    },

    /** emitter函数挂起 */
    hangUpAllEmitFunctions() {
      emitter.on(SWITCH_MODAL, this.swtichModal);
      emitter.on(GET_OPTIONS, this.setOptionListFromSelect);
    },

    /** 向当前select 插入options */
    insertOptionsToSelect(options: Option[]) {
      (window as any).devEditor.execute(COMMAND_NAME__INSERT_OPTIONS, options);
    },

    /** 获取当前select的options list */
    setOptionListFromSelect(options: Option[]) {
      console.log(options);
      this.selectedOptions = _.cloneDeep(options);
    },
  },
  computed: {
    nowMode() {
      if (this.nowMode) {
        return this.nowMode;
      }
    },
  },
};
</script>
<style scoped></style>
