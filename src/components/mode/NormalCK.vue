<template>
  <div>
    <el-button type="primary" @click="exportData" plain>导出</el-button>
    <br />
    <br />
<div class="content">
  <div id="devEditor"></div>
  <el-form
    ref="formRef"
    :model="dynamicValidateForm"
    label-width="120px"
    class="demo-dynamic"
  >
    <el-form-item
      prop="modelName"
      label="modelName"
      :rules="[
        {
          required: true,
          message: 'Please input email address',
          trigger: 'blur',
        },
        {
          message: 'Please input correct email address',
          trigger: ['blur', 'change'],
        },
      ]"
    >
      <el-input v-model="dynamicValidateForm.modelName" />
    </el-form-item>
    <el-form-item
      prop="radio"
      :rules="[
        {
          required: true,
          trigger: 'blur',
        }
      ]"
      label="type">
      <el-radio-group v-model="dynamicValidateForm.radio" @change="changeRadio">
        <el-radio :label="1">Option A</el-radio>
        <el-radio :label="2">Option B</el-radio>
        <el-radio :label="3">Option C</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-for="(domain, index) in dynamicValidateForm.domains"
      :key="domain.key"
      :label="'cases' + index"
      :prop="'domains.' + index + '.value'"
      :rules="{
        required: true,
        message: 'cases can not be null',
        trigger: 'blur',
      }"
    >
      <el-input v-model="domain.value" />
      <el-button class="mt-2" @click.prevent="removeDomain(domain)"
        >Delete</el-button>
      <el-button class="mt-2" @click.prevent="CheckDomain(domain)"
        >CheckSection</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm(dynamicValidateForm)">Submit</el-button>
      <el-button @click="addDomain">New cases</el-button>
      <el-button @click="resetForm()">Reset</el-button>
    </el-form-item>
  </el-form>
</div>
  </div>
  <SelectDialog :visible="dialogVisible" :change-visible="swtichModal" :table-data="selectedOptions" :insert-options-to-select="insertOptionsToSelect" />
  <SectionDialog :visible="sectionVisible" :type-radio="typeRadio" :change-visible="sectionModal" :form-data="sectionOption" :insert-section-command="InsertSectionCommand" @getFormValue="getFormValue" />
</template>
<style scoped>
.hidden-item {
  display: none;
}
.extendBackground {
  background-color: rgba(255, 169, 77, 0.2) !important;
}
.ck-editor{
  width: 700px !important;
}
</style>

<script lang="ts">
import _ from "lodash";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { NORMAL_CONFIG } from "./config.js";
import { emitter, SWITCH_MODAL,SECTION_MODAL, Option,Section, GET_OPTIONS } from "./mitt";
import SelectDialog from "./SelectDialog/index.vue";
import SectionDialog from "./SectionDialog/index.vue";
import { COMMAND_NAME__INSERT_OPTIONS } from "../../plugins/controlsMenu/constant";
import { COMMAND__INSERT_SECTION } from "../../plugins/section/constant";
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import "../../plugins/theme/style-setion.css"
import { V_SECTION } from "../../plugins/section/constant";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import selection from "@ckeditor/ckeditor5-engine/src/model/selection";
export default {
  props: ["htmlData", "nowMode", "onchange"],
  data() {
    return {
      editor: {},
      anchor: null,
      deposit: {},
      dialogVisible: false,
      selectedOptions: [], //当前选中select 有哪些options，用来将options传递到弹窗表格内
      attr_id:1,
      sectionVisible: false,
      typeRadio: [
        { label: "可删除", value: "delete" },
        { label: "可切换", value: "switch" },
        { label: "适用/不适用", value: "applicable" },
      ],
      sectionOption: {
        modelName: "",
        type: "switch",
        cases: [],
      },
      dynamicValidateForm:{
        domains: [
          {
            key: 1,
            value: '',
          },
        ],
        modelName: '',
        radio:1,
      },
      SectionData:[],
    };
  },
  components: { SelectDialog,SectionDialog },
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
    /** 向当前section 插入section + 属性 */
    InsertSectionCommand(section: Section[]) {
      (window as any).devEditor.execute(COMMAND__INSERT_SECTION, section);
    },

    /** 获取当前select的options list */
    setOptionListFromSelect(options: Option[]) {
      this.selectedOptions = _.cloneDeep(options);
    },
    /** section选中效果 */
    onParagraph(e) {
      // if(document.getElementsByClassName('ck-editor')[0].contains(e.srcElement)){
      //   let check = document.getElementsByClassName("Check")
      //   for(let i = 0;i<check.length;i++){
      //     check[i].classList.remove('Check')
      //   }
      // }
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
          // clickDom.focus();
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
    /** 删除选中section及cases */
    removeDomain (item) {
      const index = this.dynamicValidateForm.domains.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm.domains.splice(index, 1)
        this.SectionData.splice(index,1)
      }
    },
    /** 切换选中的section */
    CheckDomain(item){
      const index = this.dynamicValidateForm.domains.indexOf(item)
      let data = JSON.parse(JSON.stringify(this.SectionData[index]))
      const model = (window as any).devEditor.model;
      const selection:selection = model.document.selection;
      const firstRange = selection.getFirstPosition();
      const LastRange = selection.getLastPosition();
      model.change(writer=>{
        let elementRange = writer.createRange(firstRange, LastRange);
        // 通过section 范围获取到范围内的 element
        const element = model.schema.getLimitElement(elementRange);
        const range = writer.createRangeOn(element);
        // 删除section
        writer.remove(range);
        // 创建新的element，插入
        const sectionElement =  this.createSectionElement(writer,data);
        model.insertContent(sectionElement, model.document.selection,'on')
      })
    },
    /** 增加section的cases */
    addDomain (){
      if(this.dynamicValidateForm.domains.length<4){
        this.dynamicValidateForm.domains.push({
          key: Date.now(),
          value: '',
        });
        // let num = this.dynamicValidateForm.domains.length-1
        // let check = document.getElementsByClassName("Check")[0];
        // console.log(JSON.parse(JSON.stringify(this.SectionData)))
        // console.log(check.outerHTML)
      }
    },
    /** 提交保存section数据 */
    submitForm (formEl) {
      let userFormData = JSON.parse(JSON.stringify(formEl))
      console.log(userFormData)
      if(!userFormData.modelName || userFormData.modelName == "") return;
      if(userFormData.domains.some(item=>!item.value || item.value == "" )) return;

      if (!userFormData) return;
      // formEl.validate((valid) => {
      //   if (valid) {
      //     console.log('submit!')
      //   } else {
      //     console.log('error submit!')
      //     return false
      //   }
      // })
      let modelData = {
        type:userFormData.radio,
        modelName:userFormData.modelName,
        cases:userFormData.domains[userFormData.domains.length - 1].value
      }
      const model = (window as any).devEditor.model;
      const selection:selection = model.document.selection;
      const parent = Array.from( selection.getSelectedBlocks() )[0].parent;
      const blocks = Array.from(Array.from(selection.getSelectedBlocks())[0].parent.getChildren());
      const firstRange = selection.getFirstPosition();
      const LastRange = selection.getLastPosition();
      const DocumentData = []
      blocks.map(item=>{
        DocumentData.push(item.toJSON())
      })
      model.change(writer => {
        let elementRange = writer.createRange(firstRange, LastRange);
      // 通过section 范围获取到范围内的 element
        const element = model.schema.getLimitElement(elementRange);
        const range = writer.createRangeOn(element);
        let markerName = userFormData.domains[userFormData.domains.length - 1].value
        // writer.addMarker(markerName, { range, usingOperation: true } );
        // 删除section
        writer.remove(range)
        // 执行创建section元素并添加子元素
        const sectionElement =   this.createSectionElement(writer,DocumentData,modelData)
        this.SectionData.push(JSON.parse(JSON.stringify(sectionElement)))
        model.insertContent(sectionElement, model.document.selection,'on')
    });
    },
    resetForm(formEl) {
      if (!formEl) return
      formEl.resetFields()
    },
    /**
     * 
     * @param writer 
     * @param DocumentData 创建section所需的元素
     * @param data section属性参数
     */
    createSectionElement(writer: Writer,DocumentData,data){
      let modeData ={}
      if(data){
         modeData = {
          modelName:data.modelName,
          type:data.type,
          cases:data.cases,
        }
      }
      if(DocumentData.name && DocumentData.name =='v-section'){
        const create = writer.createElement(V_SECTION,DocumentData.attributes);
        DocumentData.children.map(item=>{
          const p = writer.createElement(item.name); 
          let dataname = "";
          item.children.map((items,index)=>{
            console.log(items)
              let text = writer.createText(items.data,items.attributes);
                writer.append( text, p);
                writer.append( p, create);
            })
        })
        return create;
      }
      const create = writer.createElement(V_SECTION,modeData);
      DocumentData.map(item=>{
        console.log(item)
        const p = writer.createElement(item.name); 
        let dataname = "";
        item.children.map((items,index)=>{
          console.log(items)
            let text = writer.createText(items.data,items.attributes);
              writer.append( text, p);
              writer.append( p, create);
          })
      })
      console.log(create)
      // 创建section 及子元素
      // ,{type:data.radio,cases:data.domains[0].value,modelName:data.modelName}
      // (data || []).forEach(opt => {
      // })
      // const p = writer.createElement("p"); 
      // writer.append( p, create);

       // 创建section的子元素
      //  const create = writer.createElement(V_SECTION); 
      // (data || []).forEach(opt => {
      //   console.log(opt)
      //   const p = writer.createElement("p", opt as any); 
      //   console.log(create)
      //   writer.append( p, create);
      // })
      // const p = writer.appendText( 'foo', create );
      
      // console.log(data)

      return create
      
    },
    changeRadio(val){
      
    }
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
