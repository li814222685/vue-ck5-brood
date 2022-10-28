<template>
  <div>
    <el-button type="primary" @click="exportData" plain>导出</el-button>
    <br />
    <br />

    <div id="devEditor"></div>
  </div>
  <SelectDialog :visible="dialogVisible" :change-visible="swtichModal" :table-data="selectedOptions" :insert-options-to-select="insertOptionsToSelect" />
  <SectionDialog :visible="sectionVisible" :type-radio="typeRadio" :change-visible="sectionModal" :form-data="sectionOption" @getFormValue="getFormValue" />
</template>
<style>
.hidden-item {
  display: none;
}
.extendBackground {
  background-color: rgba(255, 169, 77, 0.2) !important;
}
</style>

<script lang="ts">
import _ from "lodash";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { NORMAL_CONFIG } from "./config.js";
import { emitter, SWITCH_MODAL, SECTION_MODAL, Option, GET_OPTIONS } from "./mitt";
import SelectDialog from "./SelectDialog/index.vue";
import SectionDialog from "./SectionDialog/index.vue";
import { COMMAND_NAME__INSERT_OPTIONS } from "../../plugins/controlsMenu/constant";
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import "../../plugins/section/theme/style-setion.css"

export default {
  props: ["htmlData", "nowMode", "onchange"],
  data() {
    return {
      editor: {},
      anchor: null,
      deposit: {},
      dialogVisible: false,
      selectedOptions: [], //当前选中select 有哪些options，用来将options传递到弹窗表格内
      sectionVisible: false,
      sectionOption: {
        modelName: "",
        type: "switch",
        cases: [],
      },
      typeRadio: [
        { label: "可删除", value: "delete" },
        { label: "可切换", value: "switch" },
        { label: "适用/不适用", value: "applicable" },
      ],
      sectionInfo: "",
      attr_id:1,
    };
  },
  components: { SelectDialog, SectionDialog },
  mounted() {
    window.addEventListener("mousedown", this.onParagraph);
    //挂载Emitter
    this.hangUpAllEmitFunctions();
    ClassicEditor.create(document.querySelector("#devEditor"), NORMAL_CONFIG)
      .then(editor => {
        CKEditorInspector.attach(editor);
        //编辑器实例挂载到 Window
        (window as any).devEditor = editor;
        editor.setData(this.htmlData);
      })
      .catch(error => {
        console.error(error);
      });
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

    sectionModal() {
      this.sectionVisible = !this.sectionVisible;
      this.sectionOption = {
        modelName: "",
        type: "switch",
        cases: [],
      };
      //每次关闭MODAL后都清空 Table 数据
      // emitter.emit(GET_OPTIONS, []);
    },
    getFormValue(val) {
      this.sectionInfo = JSON.stringify(val);
    },

    /** emitter函数挂起 */
    hangUpAllEmitFunctions() {
      emitter.on(SWITCH_MODAL, this.swtichModal);
      emitter.on(SECTION_MODAL, this.sectionModal);
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
    onParagraph(e) {
      if(document.getElementsByClassName('ck-editor')[0].contains(e.srcElement)){
        let check = document.getElementsByClassName("Check")
        for(let i = 0;i<check.length;i++){
          check[i].classList.remove('Check')
        }
      }
      setTimeout(() => {
        const clickDom = <HTMLElement>document.elementFromPoint(e.clientX, e.clientY);
        const isSetion = Array.from(clickDom.classList).includes('section');
        // 点击可编辑区域时候执行
        // 是否为段落标签
        if (isSetion) {
          let check = document.getElementsByClassName("Check")
          for(let i = 0;i<check.length;i++){
            check[i].classList.remove('Check')
          }
          clickDom.classList.add('Check')
          clickDom.setAttribute('attr_id',"" + this.attr_id ++)
          clickDom.focus();
          var descDiv = document.querySelector(".icon-but");
          document.body.appendChild(descDiv);
        }else{
          // parent 当前选中元素的父元素
          let parent = <HTMLElement>clickDom.parentNode
          // 选中效果
          if(parent.className.search('section') !== -1){
            let check = document.getElementsByClassName("Check")
            for(let i = 0;i<check.length;i++){
              check[i].classList.remove('Check')
            }
            parent.classList.add('Check')
          }else{
          // const editor = window.editor;
          // console.log(window.editor)
        //  editor.editing.view.document.on( 'change:isFocused', ( evt, data, isFocused ) => {
        //       console.log( `View document is focused: ${ isFocused }.` );
        //   } );
            // let check = document.getElementsByClassName("Check")
            // for(let i = 0;i<check.length;i++){
            //   check[i].classList.remove('Check')
            // }
          }
        }
      }, 1);
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
