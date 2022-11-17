<template>
  <div>
    <el-button type="primary" @click="exportData" plain>导出</el-button>
    <br />
    <br />
    <div class="content">
      <div id="devEditor"></div>
      <el-form ref="formRef" :model="dynamicValidateForm" label-width="120px" class="demo-dynamic">
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
            },
          ]"
          label="type"
        >
          <el-radio-group v-model="dynamicValidateForm.radio" @change="changeRadio">
            <el-radio label="deletable">deletable</el-radio>
            <el-radio label="switchable">switchable</el-radio>
            <el-radio label="applicable">applicable</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-for="(domain, index) in dynamicValidateForm.cases"
          :key="domain.key"
          :label="'cases' + index"
          :prop="'cases.' + index + '.value'"
          :rules="{
            required: true,
            message: 'cases can not be null',
            trigger: 'blur',
          }"
        >
          <el-input v-model="domain.value" />
          <el-button class="mt-2" type="primary" @click.prevent="submitForm(domain, dynamicValidateForm)">submit</el-button>
          <el-button class="mt-2" @click.prevent="removeDomain(domain)">Delete</el-button>
          <el-button class="mt-2" @click.prevent="CheckDomain(domain)">CheckSection</el-button>
          <el-button class="mt-2" @click.prevent="CheckTopping(domain)">Topping</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitSection()">SubmitSection</el-button>
          <el-button @click="addDomain">New cases</el-button>
          <el-button @click="resetForm()">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
  <SelectDialog :visible="dialogVisible" :change-visible="swtichModal" :table-data="selectedOptions" :insert-options-to-select="insertOptionsToSelect" />
</template>
<style scoped>
.hidden-item {
  display: none;
}
.extendBackground {
  background-color: rgba(255, 169, 77, 0.2) !important;
}
.ck-editor {
  width: 700px !important;
}
</style>

<script lang="ts">
import _ from "lodash";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { NORMAL_CONFIG } from "./config.js";
import { emitter, SWITCH_MODAL, SECTION_MODAL, Option, Section, GET_OPTIONS } from "./mitt";
import SelectDialog from "./SelectDialog/index.vue";
import { COMMAND_NAME__INSERT_OPTIONS } from "../../plugins/controlsMenu/constant";
import { COMMAND__INSERT_SECTION } from "../../plugins/section/constant";
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import "../../plugins/theme/style-setion.css";
import { V_SECTION, V_SPAN } from "../../plugins/section/constant";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import { parse, stringify } from "himalaya";
import { safeJsonStringify, safeJsonParse } from "../utils";
export default {
  props: ["htmlData", "nowMode", "onchange"],
  data() {
    return {
      editor: {},
      anchor: null,
      deposit: {},
      dialogVisible: false,
      selectedOptions: [], //当前选中select 有哪些options，用来将options传递到弹窗表格内
      attr_id: 1,
      dynamicValidateForm: {
        cases: [
          {
            value: "",
          },
        ],
        modelName: "",
        radio: "deletable",
      },
      SectionData: [], // element元素
      SectionDataHTML: [], // html文本
    };
  },
  components: { SelectDialog },
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
        const isSetion = Array.from(clickDom.classList).includes("section");
        // 点击可编辑区域时候执行
        // 是否为段落标签
        if (isSetion) {
          let check = document.getElementsByClassName("Check");
          for (let i = 0; i < check.length; i++) {
            check[i].classList.remove("Check");
          }
          clickDom.classList.add("Check");
          const model = (window as any).devEditor.model;
          const selection: selection = model.document.selection;
          const parent: any = Array.from(selection.getSelectedBlocks())[0].parent;
          if (parent.getAttribute("modelname") !== "undefind") {
            // console.log(parent.getAttribute("modelname"));
          }
          // clickDom.focus();
        } else {
          // parent 当前选中元素的父元素
          let parent = <HTMLElement>clickDom.parentNode;
          // 选中效果
          if (parent.className.search("section") !== -1) {
            let check = document.getElementsByClassName("Check");
            for (let i = 0; i < check.length; i++) {
              check[i].classList.remove("Check");
            }
            parent.classList.add("Check");
          } else {
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
    removeDomain(item) {
      const index = this.dynamicValidateForm.cases.indexOf(item);
      if (index !== -1) {
        this.dynamicValidateForm.cases.splice(index, 1);
        this.SectionData.splice(index, 1);
        this.SectionDataHTML.splice(index, 1);
      }
      if (item.value == "") {
      } else {
        setTimeout(() => {
          this.CheckDomain(this.dynamicValidateForm.cases[0]);
        }, 500);
      }
    },
    /** 切换选中的section */
    CheckDomain(item) {
      const index = this.dynamicValidateForm.cases.indexOf(item);
      let SectionData = safeJsonParse(safeJsonStringify(this.SectionData[index]));
      let SectionDataHTML = this.SectionDataHTML[index];
      const parserSection = parse(SectionDataHTML);
      const model = (window as any).devEditor.model;
      const selection = model.document.selection;
      const firstRange = selection.getFirstPosition();
      const LastRange = selection.getLastPosition();
      model.change(writer => {
        let elementRange = writer.createRange(firstRange, LastRange);
        // 通过section 范围获取到范围内的 element
        let element = model.schema.getLimitElement(elementRange);
        const parent: any = selection.getFirstPosition().parent;
        if (element.name === "$root") {
          if (parent.previousSibling && parent.previousSibling.name == "v-section" && !parent.previousSibling.getAttribute("currentcase")) {
            element = parent.previousSibling;
          } else if (parent.nextSibling && parent.nextSibling.name == "v-section" && !parent.nextSibling.getAttribute("currentcase")) {
            element = parent.nextSibling;
          }
        }
        const range = writer.createRangeOn(element);
        // 删除section
        // writer.remove(range);
        // 创建新的element，插入   newElement ：dom创建   sectionElement ：element元素创建
        const newElement = this.createSectionInner(writer, parserSection, null, this);
        // const sectionElement = this.createSectionElement(writer, SectionData);
        // model.insertContent(newElement, model.document.selection, "on");
        model.insertObject(newElement, range);
        // setTimeout(() => {
        //   // 存储section的html
        //   let set = document.getElementById(element.getAttribute('id'));
        //   console.log(set)
        //   console.log(this.SectionDataHTML[index])
        //   this.SectionDataHTML[index] = set.outerHTML;
        // }, 1000);
      });
    },
    /** 置顶当前选中的section */
    CheckTopping(item) {
      const index = this.dynamicValidateForm.cases.indexOf(item);
      let data = this.SectionData;
      let datas = this.dynamicValidateForm.cases;
      let datass = this.SectionDataHTML;
      data.map((items, indexs) => {
        if (index == indexs) {
          data.unshift(data.splice(indexs, 1)[0]);
          datas.unshift(datas.splice(indexs, 1)[0]);
          datass.unshift(datass.splice(indexs, 1)[0]);
        }
      });
      this.CheckDomain(item);
    },
    /** 增加section的cases */
    addDomain() {
      if(this.dynamicValidateForm.radio == "switchable" && this.dynamicValidateForm.cases.length <= 1){
        this.dynamicValidateForm.cases.push({
          value: "",
        });
      }else if (this.dynamicValidateForm.radio !== "switchable" && this.dynamicValidateForm.cases.length < 4) {
        this.dynamicValidateForm.cases.push({
          value: "",
        });
      }else{
      }
    },
    /** 保存当前cases的section数据 */
    submitForm(item, formEl) {
      const index = this.dynamicValidateForm.cases.indexOf(item);
      const userFormData = safeJsonParse(safeJsonStringify(formEl));
      if (!userFormData.modelName || userFormData.modelName == "") return;
      if (userFormData.cases.some(item => !item.value || item.value == "")) return;
      if (!userFormData) return;
      let cases = [];
      userFormData.cases.map(item => {
        cases.push(item.value);
      });
      let modelData = {
        type: userFormData.radio,
        modelname: userFormData.modelName,
        "data-cases": cases,
        id: "section" + userFormData.cases.length,
      };
      const model = (window as any).devEditor.model;
      const selection: selection = model.document.selection;
      const parent: any = Array.from(selection.getSelectedBlocks())[0].parent;
      const blocks = Array.from(Array.from(selection.getSelectedBlocks())[0].parent.getChildren());
      let DocumentData = blocks.map(item => item.toJSON());
      model.change(writer => {
        // 通过section 范围获取到范围内的 element
        const firstRange = selection.getFirstPosition();
        const LastRange = selection.getLastPosition();
        const elementRange = writer.createRange(firstRange, LastRange);
        let element = model.schema.getLimitElement(elementRange);
        const parent: any = selection.getFirstPosition().parent;
        if (element.name === "$root") {
          if (parent.previousSibling && parent.previousSibling.name == "v-section" && !parent.previousSibling.getAttribute("currentcase")) {
            element = parent.previousSibling;
          } else if (parent.nextSibling && parent.nextSibling.name == "v-section" && !parent.nextSibling.getAttribute("currentcase")) {
            element = parent.nextSibling;
          }
          DocumentData = Array.from(element.getChildren()).map((item: any) => item.toJSON());
        }
        const range = writer.createRangeOn(element);
        // 删除section
        // writer.remove(range);
        // 执行创建section元素并添加子元素
        const sectionElement = this.createSectionElement(writer, DocumentData, modelData);
        this.SectionData[index] = safeJsonParse(safeJsonStringify(sectionElement));
        // console.log(sectionElement, range, element, "DocumentData");
        model.insertObject(sectionElement, range);
        // model.insertContent(sectionElement, model.document.selection, "on");
        let idname = "section" + userFormData.cases.length;
        setTimeout(() => {
          // 存储section的html
          let set = document.getElementById(idname);
          this.SectionDataHTML[index] = set.outerHTML;
        }, 1000);
      });
    },
    /** 提交当前modelname所属的section数据 */
    submitSection(num) {
      const HTMLdata = safeJsonParse(safeJsonStringify(this.SectionDataHTML));
      const cases = this.dynamicValidateForm.cases.map(item => item.value);
      let casesList = {};
      HTMLdata.forEach((item, index) => {
        let data = item.match(/data-cases=\"(.*?)\]"/g)[0];
        let currentcases = item.match(/currentcase=\"(.*?)\"/g)[0];
        (casesList as any)[cases[index]] = HTMLdata[index].replace(currentcases, "currentcase=" + safeJsonStringify(this.dynamicValidateForm.cases[0].value));
        (casesList as any)[cases[index]] = HTMLdata[index].replace(data, 'data-cases="' + safeJsonStringify(cases) + '"');
        let text = HTMLdata[index].replace(currentcases, "currentcase=" + safeJsonStringify(this.dynamicValidateForm.cases[0].value))
        // console.log((casesList as any)[cases[index]], HTMLdata[index], text, "caselist");
        HTMLdata[index] = HTMLdata[index].replace(data, 'data-cases="' + safeJsonStringify(cases) + '"');
        HTMLdata[index] = HTMLdata[index].replace(currentcases, "currentcase=" + safeJsonStringify(this.dynamicValidateForm.cases[0].value));
      });
      this.SectionDataHTML = HTMLdata;
      if(num == 2){
        this.$emit("getStudentName", casesList);
      }else{
        this.submitSection(2)
      }
    },
    resetForm(formEl) {
      if (!formEl) return;
      formEl.resetFields();
    },
    /**
     *
     * @param writer
     * @param DocumentData 创建section所需的元素
     * @param data section属性参数
     */
    createSectionElement(writer: Writer, DocumentData, data) {
      let modeData = {};
      if (data) {
        modeData = {
          modelname: data.modelname,
          type: data.type,
          "data-cases": safeJsonStringify(data["data-cases"]).replace(/"/g, "'"),
          id: data.id,
          currentcase: data["data-cases"][0],
        };
      }
      if (DocumentData.name && DocumentData.name == "v-section") {
        const create = writer.createElement(V_SECTION, DocumentData.attributes);
        DocumentData.children.map(item => {
          const p = writer.createElement(item.name);
          let dataname = "";
          item.children.map((items, index) => {
            let text = writer.createText(items.data, items.attributes);
            writer.append(text, p);
            writer.append(p, create);
          });
        });
        return create;
      }
      const create = writer.createElement(V_SECTION, modeData);
      DocumentData.map(item => {
        const p = writer.createElement(item.name);
        let dataname = "";
        item.children.map((items, index) => {
          let text = writer.createText(items.data || items.name, items.attributes);
          writer.append(text, p);
          writer.append(p, create);
        });
      });
      return create;
    },
    createSectionInner(writer, parserDom, parentElement) {
      let elementList = [],
        text = null,
        dom = null;
      for (let item of parserDom) {
        if (item.type === "element") {
          // 返回元素属性对象
          let atttibutesList = item.attributes.map(item => [item.key, item.value]);
          atttibutesList = Object.fromEntries([...atttibutesList]);
          // 创建元素
          if (item.tagName === "section") {
            const cases = this.dynamicValidateForm.cases.map(item =>item.value);
            atttibutesList["data-cases"] = safeJsonStringify(cases).replace(/"/g, "'")
            atttibutesList.currentcase = this.dynamicValidateForm.cases[0].value;
            dom = writer.createElement(V_SECTION, atttibutesList);
          } else if (item.tagName === "p") {
            dom = writer.createElement("paragraph", atttibutesList);
          } else if (item.tagName === "span") {
            item.children.map(items => {
              dom = writer.createText(items.content, { restrictedEditingException: true });
            });
            // dom = writer.createElement(V_SPAN, atttibutesList);
            // dom = writer.createText(V_SPAN, atttibutesList);
          } else {
            atttibutesList["data-cke-ignore-events"] = true;
            dom = writer.createElement(item.tagName, atttibutesList);
          }
          // 插入到父级元素
          if (parentElement) {
            writer.append(dom, parentElement);
          }
        } else {
          // 不是元素的创建文字插入到dom中
          text = writer.insertText(item.content, parentElement);
        }
        // 递归
        if (item.children && item.tagName !== "span") {
          this.createSectionInner(writer, item.children, dom);
        }
      }
      return dom;
    },
    changeRadio(val) {},
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
<style scoped>
.hidden-item {
  display: none;
}
.extendBackground {
  background-color: rgba(255, 169, 77, 0.2) !important;
}
.ck-editor {
  width: 700px !important;
}
</style>
