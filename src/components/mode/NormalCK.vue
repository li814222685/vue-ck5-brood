<template>
  <div id="normalMode">
    <el-button type="primary" @click="exportData" plain>导出</el-button>
    <br />
    <br />

    <div id="devEditor"></div>
  </div>
  <SelectDialog
    :visible="dialogVisible"
    :change-visible="swtichModal"
    :table-data="selectedOptions"
    :insert-options-to-select="insertOptionsToSelect"
    :needEditElement="needEditElement"
  />
  <CreateTableDialog :visible="createTableVis" :change-visible="changeCreateTableVis" />
  <SetTurpleDialog
    :visible="setTurpleVis"
    :change-visible="changeSetTurpleVis"
    :anchorCellEle="anchorCellEle"
  />
</template>
<style scoped>
.hidden_item {
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
import {
  emitter,
  SWITCH_MODAL,
  Option,
  SET_OPTIONS,
  SET_TARGET,
  SWITCH_ADD_TABLE_MODAL,
  SWITCH_SET_TURPLE_MODAL,
} from "./mitt";
import SelectDialog from "./SelectDialog/index.vue";
import CreateTableDialog from "./CreateTableDialog/index.vue";
import SetTurpleDialog from "./SetTurpleDialog/index.vue";

import { COMMAND_NAME__INSERT_OPTIONS } from "../../plugins/controlsMenu/constant";
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import JqxDropDownList from "jqwidgets-scripts/jqwidgets-vue/vue_jqxdropdownlist.vue";
import { removeClass, removeElement } from "../utils.js";
import { EditorClasses } from "./define";
import { toRaw } from "@vue/reactivity";
import {
  COMMAND_NAME__SET_TABLE_SELECT_OPTIONS,
  HIDDEN_ITEM,
} from "../../plugins/tableControls/constant";
import { Element } from "@ckeditor/ckeditor5-engine";

export default {
  props: ["htmlData", "nowMode", "onchange"],
  data() {
    return {
      editor: {},
      anchor: null,
      needEditElement: null,
      deposit: {
        range: null,
        element: null,
      },
      anchorCellEle: null, //当前配置Turple的锚点元素
      setTurpleVis: false,
      createTableVis: false,
      dialogVisible: false,
      selectedOptions: [], //当前选中select 有哪些options，用来将options传递到弹窗表格内
    };
  },
  components: { SelectDialog, JqxDropDownList, CreateTableDialog, SetTurpleDialog },
  mounted() {
    //挂载Emitter
    this.hangUpAllEmitFunctions();
    // window.addEventListener("mousedown", onGlobalClick.onClickEntry);

    ClassicEditor.create(document.querySelector("#devEditor"), NORMAL_CONFIG)
      .then(editor => {
        CKEditorInspector.attach(editor);
        //编辑器实例挂载到 Window
        (window as any).devEditor = editor;
        editor.setData(this.htmlData);
        const widgetTypeAroundPlugin = editor.plugins.get("WidgetTypeAround");
        widgetTypeAroundPlugin.forceDisabled("MyApplication");
      })
      .catch(error => {});
  },
  methods: {
    exportData() {
      this.onchange((window as any).devEditor.getData());
    },
    swtichModal() {
      this.dialogVisible = !this.dialogVisible;
      if (!this.dialogVisible) {
        //每次关闭MODAL后都清空 Table 数据
        emitter.emit(SET_OPTIONS, []);
        //每次关闭后清空tableSelect 的 缓存 target
        this.needEditElement = null;
      }
    },

    /** emitter函数挂起 */
    hangUpAllEmitFunctions() {
      emitter.on(SWITCH_MODAL, this.swtichModal);
      emitter.on(SET_OPTIONS, this.setOptionListFromSelect);
      emitter.on(SET_TARGET, this.setNeedEditElement);
      emitter.on(SWITCH_ADD_TABLE_MODAL, this.changeCreateTableVis);
      emitter.on(SWITCH_SET_TURPLE_MODAL, this.changeSetTurpleVis);
    },

    /** 向当前select 插入options */
    insertOptionsToSelect(options: Option[]) {
      //Table Select 配置Option
      if (this.needEditElement) {
        (window as any).devEditor.execute(
          COMMAND_NAME__SET_TABLE_SELECT_OPTIONS,
          options,
          toRaw(this.needEditElement)
        );
      } else {
        //Normal Select 配置Option
        (window as any).devEditor.execute(COMMAND_NAME__INSERT_OPTIONS, options);
      }
    },

    /** 设置当前select的options list */
    setOptionListFromSelect(options: Option[]) {
      this.selectedOptions = _.cloneDeep(options).map(item => ({
        id: _.uniqueId(),
        ...item,
      }));
    },

    setNeedEditElement(ele: Element) {
      this.needEditElement = ele;
    },

    changeCreateTableVis() {
      this.createTableVis = !this.createTableVis;
    },
    changeSetTurpleVis(anchorEle?) {
      !this.setTurpleVis ? (this.anchorCellEle = anchorEle) : (this.anchorCellEle = null);

      this.setTurpleVis = !this.setTurpleVis;
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
  height: 20px;
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
.ck-widget__selection-handle {
  display: none;
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
  // border-bottom: 1px solid #d8d7d9 !important;
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
  // padding: 0 10px;
  // height: 28px;
  /* border: 1px solid #1769fe; */
  border-bottom: 2px solid rgba(218, 130, 36, 0.437);

  border-radius: 4px;
  font-size: 16px;
  /* color: #1968ff; */
  /* background: #dce9ff; */
  // background: rgba(255, 169, 77, 0.2);
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
  border-top: 8px solid rgba(235, 142, 42, 0.437);
}

.triangle_down {
  transform: rotate(-135deg) !important;
  -webkit-transform: rotate(-135deg) !important;
  border: 3px solid black;
  /* 上、右、下、左 四个边框的宽度 */
  border-width: 0px 1px 1px 0px;

  display: inline-block;
  /* padding值控制箭头大小 */
  padding: 5px;

  width: 0;
  height: 0;
  right: 8px;
  top: 12px;
  position: absolute;
  // border-left: 8px solid transparent;
  // border-right: 8px solid transparent;
  // border-top: 8px solid rgba(235, 142, 42, 0.437);
  // transform: rotate(180deg);
  // transition: transform 0.2s linear;
}

/* Option 列表   */

.v_select_optionList {
  // border: 1px solid rgba(218, 130, 36, 0.437);
  width: inherit;
  background-color: white;
  display: block;
  position: absolute;
  max-height: 105px;
  overflow-y: scroll;
  overflow-x: hidden;
  box-shadow: 4px 6px 6px -5px #000;
  z-index: 999;
  border-top: 2px solid #0077be !important;
  border-left: 1px solid #e0e0e0 !important;
  border-right: 1px solid #e0e0e0 !important;
  border-bottom: 1px solid #e0e0e0 !important;
  padding-right: 10px;
  margin-left: -6px;
  margin-top: -1px;
  animation: slideContentUp 0.2s linear both;
}

@keyframes slideContentUp {
  from {
    height: 0;
  }
  to {
    height: 105px;
  }
}

.v_select_optionList_item {
  width: 100%;
  padding: 5px;
  // background-color: rgb(250, 235, 215);
}

.v_select_optionList_item:hover {
  background-color: #eeeeeeb3;
}

.hidden_item {
  display: none;
}
#normalMode {
  .table table tbody :first-child td {
    padding-top: 0px !important;
    padding-bottom: 0px !important;
    background-color: #eeeeeeb3;
    cursor: pointer !important;
    span {
      cursor: pointer !important;
    }
  }
  // .table table tbody :first-child td:hover {
  //   background-color: #cccacab3;
  // }
  //去除锚点选中后的 聚焦边框和背景
  // .table table tbody :first-child td:focus,
  // .table table tbody tr td:first-child:focus {
  //   background-color: #cccacab3 !important;
  //   outline: none !important;
  // }
  .table table tbody tr td:first-child {
    background-color: #eeeeeeb3;
    padding: 0px !important;
    width: 22px;
    cursor: pointer !important;

    span {
      cursor: pointer !important;
    }
  }
  // .table table tbody tr td:first-child:hover {
  //   background-color: #cccacab3;
  // }
}
</style>
