<template>
  <div id="normalMode">
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
<style lang="less">
.rawSelect {
  width: 200px;
  height: 30px;
  border: 2px solid red;
}

/* Select 最外层容器 */
.v_select {
  /* 事实上Select 的宽高应该是自适应的，支持外部参数来改变 Select 对应的宽高 */
  width: inherit;
  height: 30px;
  background: #ffefdf;
  .ck-widget__type-around__button {
    display: none !important;
  }

  .ck-editor__nested-editable:focus {
    border: none;
  }
}
.ck-widget_selected,
.ck-widget_selected:hover {
  outline: none !important;
}
.v_select:hover {
  outline: none !important;
}
.v_select:focus {
  outline: red !important;
}
.v_select::selection {
  display: none;
}

/* Select 的选择框 */
.v_select_dropDown {
  position: relative;
  height: inherit;
  background: inherit !important;
}
.v_select_dropDown:focus {
  outline: red !important;
}

/* 可输入 选择框文字部分  */
.v_select_dropDown_text {
  display: block;
  height: inherit;
  /* padding: 0 10px; */
  border-bottom: 1px solid #d8d7d9 !important;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  background: inherit !important;
}
.v_select_dropDown_text :focus {
  outline: red !important;
}

/* 打开Option列表 选择框选中后的样式 */
.v_select_dropDown_text_sele {
  display: block;
  padding: 0 10px;
  line-height: 38px;
  /* border: 1px solid #1769fe; */
  border: 1px solid rgba(218, 130, 36, 0.437);

  border-radius: 4px;
  font-size: 16px;
  /* color: #1968ff; */
  /* background: #dce9ff; */
  background: rgba(255, 169, 77, 0.2);
}

.v_select_dropDown_text,
.v_select_dropDown_text_sele {
  p {
    margin: 0;
  }
}

/* 修改ContentEditable 的默认Style */
[contenteditable] {
  outline: 1px solid transparent;
}

[contenteditable]:focus {
  border-bottom: 3px solid rgba(191, 111, 26, 0.437);
  border-radius: 3px;
}

/*Select 箭头的样式  */
.triangle_up {
  width: 0;
  height: 0;
  top: 0;
  bottom: 0;
  right: 10px;
  margin: auto 0;
  position: absolute;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #323232;
}

.triangle_down {
  width: 0;
  height: 0;
  right: 20px;
  top: 17px;
  position: absolute;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(235, 142, 42, 0.437);
  transform: rotate(180deg);
  transition: transform 0.2s linear;
}

/* Option 列表   */

.v_select_optionList {
  border: 1px solid rgba(218, 130, 36, 0.437);
  border-top: none;
  display: none;
  border-radius: 4px;
}

.v_select_optionList_item {
  padding: 5px;
}

.v_select_optionList_item:hover {
  background-color: rgba(255, 169, 77, 0.2);
}

.hidden_item {
  display: none;
}
</style>
