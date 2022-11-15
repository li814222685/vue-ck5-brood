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
import {
  emitter,
  SWITCH_MODAL,
  Option,
  SET_OPTIONS,
  SAVE_HIDDEN_ITEM,
  REPLACE_HIDDEN_ITEM_TEXT,
  SET_TARGET,
} from "./mitt";
import SelectDialog from "./SelectDialog/index.vue";
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
      dialogVisible: false,
      selectedOptions: [], //当前选中select 有哪些options，用来将options传递到弹窗表格内
    };
  },
  components: { SelectDialog, JqxDropDownList },
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
      emitter.on(SAVE_HIDDEN_ITEM, this.saveCellItemAndSelectRange);
      emitter.on(REPLACE_HIDDEN_ITEM_TEXT, this.setRestrictedTextFromTableSelect);
      emitter.on(SET_TARGET, this.setNeedEditElement);
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

    /** 获取当前select的options list */
    setOptionListFromSelect(options: Option[]) {
      console.log(
        "%c🍉Lee%cline:120%coptions",
        "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
        "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
        "color:#fff;background:rgb(178, 190, 126);padding:3px;border-radius:2px",
        options
      );
      this.selectedOptions = _.cloneDeep(options);
    },

    /** 缓存隐藏的元素和TableSelect的范围 */
    saveCellItemAndSelectRange(deposit) {
      this.deposit = deposit;
    },

    /** TableSelect的值填入 可编辑文字元素 */
    setRestrictedTextFromTableSelect(val: string) {
      const editor = (window as any).devEditor;
      const model = editor.model;
      const { element: restoreItem, range: removeRange } = toRaw(this.deposit);

      console.log(
        "%c🍉Lee%cline:114%crestoreItem33333",
        "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
        "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
        "color:#fff;background:rgb(153, 80, 84);padding:3px;border-radius:2px",
        restoreItem
      );
      //1.显示隐藏的元素
      removeClass(HIDDEN_ITEM, restoreItem);
      //2.Todo：Restricted ：将value 替换 元素内的文本
      // model.change(writer => {
      //   const range = writer.createRangeOn(restoreItem._children[0]);
      //   console.log(
      //     "%c🍉Lee%cline:128%crange",
      //     "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      //     "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      //     "color:#fff;background:rgb(60, 79, 57);padding:3px;border-radius:2px",
      //     range
      //   );
      //   // const text = writer.createText(val, restoreItem.getAttributes());
      //   // model.insertContent(text, range);
      // });
      // //3. 销毁掉Select
      removeElement(removeRange);
    },

    setNeedEditElement(ele: Element) {
      this.needEditElement = ele;
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
