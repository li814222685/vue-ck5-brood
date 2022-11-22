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
          label="模块名称"
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
          label="Type"
        >
          <el-radio-group
            v-model="dynamicValidateForm.radio"
            @change="changeRadio"
          >
            <el-radio label="deletable">可删除</el-radio>
            <el-radio label="switchable">可切换</el-radio>
            <el-radio label="applicable">适用/不适用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-for="(domain, index) in dynamicValidateForm.cases"
          :key="index"
          :label="'cases' + (index + 1)"
          :prop="'cases.' + index + '.value'"
          :rules="{
            required: true,
            message: 'cases can not be null',
            trigger: 'blur',
          }"
        >
          <el-input
            class="case-input"
            v-model="domain.value"
            :readonly="dynamicValidateForm.radio == 'applicable'"
            @focus="
              () => {
                dynamicValidateForm.radio == 'applicable'
                  ? submitForm(domain, dynamicValidateForm)
                  : '';
              }
            "
            @change="submitForm(domain, dynamicValidateForm)"
            v-if="dynamicValidateForm.radio !== 'applicable'"
          >
            <template
              #append
              v-if="index == dynamicValidateForm.cases.length - 1"
            >
              <el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="top-start"
              >
                <el-button
                  :disabled="
                    dynamicValidateForm.cases.length >= 2 &&
                    dynamicValidateForm.radio == 'applicable'
                  "
                  :icon="CopyDocument"
                  @click="addDomain"
                />
              </el-tooltip>
            </template>
          </el-input>
          <el-row v-if="dynamicValidateForm.radio == 'applicable'">
            <span>{{ domain.value }}</span>
            <el-divider direction="vertical" />
            <el-button @click="submitForm(domain, dynamicValidateForm)" plain>保存</el-button>
          </el-row>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="删除"
            placement="top-start"
            v-if="dynamicValidateForm.radio !== 'applicable'"
          >
            <el-button
              type="primary"
              @click.prevent="removeDomain(domain)"
              :icon="Delete"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="切换"
            placement="top-start"
          >
            <el-button
              type="primary"
              @click.prevent="CheckDomain(domain)"
              :icon="Checked"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="置顶"
            placement="top-start"
            v-if="dynamicValidateForm.radio !== 'applicable'"
          >
            <el-button
              type="primary"
              @click.prevent="CheckTopping(domain)"
              :icon="Upload"
            ></el-button>
          </el-tooltip>
        </el-form-item>
        <!-- <el-form-item>
          <el-button :disabled="dynamicValidateForm.cases.length >= 2 && dynamicValidateForm.radio == 'applicable'" @click="addDomain">新增cases</el-button>
        </el-form-item> -->
      </el-form>
    </div>
  </div>
  <SelectDialog
    :visible="dialogVisible"
    :change-visible="swtichModal"
    :table-data="selectedOptions"
    :insert-options-to-select="insertOptionsToSelect"
  />
</template>

<script lang="ts">
import _ from "lodash";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { NORMAL_CONFIG } from "./config.js";
import {
  emitter,
  SWITCH_MODAL,
  SECTION_MODAL,
  Option,
  Section,
  GET_OPTIONS,
} from "./mitt";
import SelectDialog from "./SelectDialog/index.vue";
import { COMMAND_NAME__INSERT_OPTIONS } from "../../plugins/controlsMenu/constant";
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import "../../plugins/theme/style-setion.css";
import { V_SECTION, V_SPAN } from "../../plugins/section/constant";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import { parse, stringify } from "himalaya";
import { safeJsonStringify, safeJsonParse } from "../utils";
import { ElMessage } from "element-plus";
import { toRaw } from "vue";
import { Upload, Delete, Checked, CopyDocument } from "@element-plus/icons-vue";
export default {
  props: ["htmlData", "nowMode", "onchange", "sectionData"],
  setup() {
    return {
      Upload,
      Delete,
      Checked,
      CopyDocument,
    };
  },
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
      ValidateDeletabl: {
        cases: [
          {
            value: "",
          },
        ],
        modelName: "",
        radio: "deletable",
      },
      ValidateSwitchable: {
        cases: [
          {
            value: "",
          },
        ],
        modelName: "",
        radio: "switchable",
      },
      ValidateApplicable: {
        cases: [
          {
            value: "适用",
          },
          {
            value: "不适用",
          },
        ],
        modelName: "",
        radio: "applicable",
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
      .then((editor) => {
        CKEditorInspector.attach(editor);
        //编辑器实例挂载到 Window
        (window as any).devEditor = editor;
        editor.setData(this.htmlData);
      })
      .catch((error) => {});
  },
  methods: {
    exportData() {
      this.onchange((window as any).devEditor.getData());
      this.submitSection();
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
      const model = (window as any).devEditor.model;
      const selection: selection = model.document.selection;
      const elementSection: any = Array.from(selection.getSelectedBlocks())[0]
        .parent;
      const modelname = elementSection.getAttribute("modelname");
      const cases = elementSection.getAttribute("data-cases");
      const radio = elementSection.getAttribute("type");
      if (this.dynamicValidateForm.modelName == "") {
        if (cases && safeJsonParse(cases)) {
          if (this.dynamicValidateForm.cases[0].value == "") {
            this.dynamicValidateForm.cases.splice(0, 1);
          }
          safeJsonParse(cases).map((item, index) => {
            this.dynamicValidateForm.cases.push({ value: item });
          });
          this.dynamicValidateForm.modelName = modelname;
          this.dynamicValidateForm.radio = radio;
        }
      }
      if (elementSection.name == V_SECTION) {
        const data = toRaw(this.sectionData);

        for (let key in data) {
          this.SectionDataHTML.push(data[key]);
        }
      }
      setTimeout(() => {
        const clickDom = <HTMLElement>(
          document.elementFromPoint(e.clientX, e.clientY)
        );
        const isSetion = Array.from(clickDom.classList).includes("section");
        // 点击可编辑区域时候执行
        // 是否为段落标签
        if (isSetion) {
          let check = document.getElementsByClassName("Check");
          for (let i = 0; i < check.length; i++) {
            check[i].classList.remove("Check");
          }
          clickDom.classList.add("Check");
        } else {
          // parent 当前选中元素的父元素
          let parent = <HTMLElement>clickDom.parentNode;
          // 选中效果
          if (parent.className && parent.className.search("section") !== -1) {
            let check = document.getElementsByClassName("Check");
            for (let i = 0; i < check.length; i++) {
              check[i].classList.remove("Check");
            }
            parent.classList.add("Check");
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
      console.log(item);
      if (item.value == "") {
        return false;
      }
      const index =
        item == 2 ? 0 : this.dynamicValidateForm.cases.indexOf(item);
      // let SectionData = safeJsonParse(safeJsonStringify(this.SectionData[index]));
      let SectionDataHTML = this.SectionDataHTML[index];
      console.log(SectionDataHTML);
      const parserSection = parse(SectionDataHTML);
      const model = (window as any).devEditor.model;
      const selection = model.document.selection;
      const firstRange = selection.getFirstPosition();
      const LastRange = selection.getLastPosition();
      model.change((writer) => {
        let elementRange = writer.createRange(firstRange, LastRange);
        // 通过section 范围获取到范围内的 element
        let element = model.schema.getLimitElement(elementRange);
        const range = writer.createRangeOn(element);
        // 删除section
        // 创建新的element，插入   newElement ：dom创建   sectionElement ：element元素创建
        const newElement = this.createSectionInner(
          writer,
          parserSection,
          null,
          this
        );
        const newRange = model.insertObject(newElement, range);
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
      if (
        this.dynamicValidateForm.radio == "applicable" &&
        this.dynamicValidateForm.cases.length <= 1
      ) {
        this.dynamicValidateForm.cases.push({
          value: "",
        });
      } else if (
        this.dynamicValidateForm.radio !== "applicable" &&
        this.dynamicValidateForm.cases.length < 4
      ) {
        if (
          this.dynamicValidateForm.radio == "deletable" &&
          this.dynamicValidateForm.cases.length == 1
        ) {
          ElMessage({
            message: "可删除类型只能有一个case。",
            type: "warning",
          });
        } else {
          this.dynamicValidateForm.cases.push({
            value: "",
          });
        }
      } else {
      }
    },
    /** 保存当前cases的section数据 */
    submitForm(item, formEl) {
      console.log(321);
      const index = this.dynamicValidateForm.cases.indexOf(item);
      const userFormData = safeJsonParse(safeJsonStringify(formEl));
      if (!userFormData.modelName || userFormData.modelName == "") return;
      if (userFormData.cases.some((item) => !item.value || item.value == ""))
        return;
      if (!userFormData) return;
      let cases = [];
      userFormData.cases.map((item) => {
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
      const blocks = Array.from(
        Array.from(selection.getSelectedBlocks())[0].parent.getChildren()
      );
      let DocumentData = blocks.map((item) => item.toJSON());
      model.change((writer) => {
        // 通过section 范围获取到范围内的 element
        const firstRange = selection.getFirstPosition();
        const LastRange = selection.getLastPosition();
        const elementRange = writer.createRange(firstRange, LastRange);
        let element = model.schema.getLimitElement(elementRange);
        const range = writer.createRangeOn(element);
        // 删除section
        // writer.remove(range);
        // 执行创建section元素并添加子元素
        const sectionElement = this.createSectionElement(
          writer,
          DocumentData,
          modelData
        );
        this.SectionData[index] = safeJsonParse(
          safeJsonStringify(sectionElement)
        );
        model.insertObject(sectionElement, range);
        let idname = "section" + userFormData.cases.length;
        setTimeout(() => {
          // 存储section的html
          let set = document.getElementById(idname);
          this.SectionDataHTML[index] = set.outerHTML;
        }, 1000);
      });
    },
    /** 提交当前modelname所属的section数据 */
    submitSection(num?: number) {
      if (
        this.dynamicValidateForm.radio == "applicable" &&
        this.dynamicValidateForm.cases.length > 2
      ) {
        ElMessage({
          message: "适用/不适用类型只能有两个case。",
          type: "warning",
        });
        return;
      }
      const HTMLdata = safeJsonParse(safeJsonStringify(this.SectionDataHTML));
      const cases = this.dynamicValidateForm.cases.map((item) => item.value);
      let casesList = {};
      HTMLdata.forEach((item, index) => {
        let data = item.match(/data-cases=\"(.*?)\]"/g)[0];
        let currentcases = item.match(/currentcase=\"(.*?)\"/g)[0];
        HTMLdata[index] = HTMLdata[index].replace(
          data,
          'data-cases="' + safeJsonStringify(cases) + '"'
        );
        HTMLdata[index] = HTMLdata[index].replace(
          currentcases,
          "currentcase=" +
            safeJsonStringify(this.dynamicValidateForm.cases[0].value)
        );
        (casesList as any)[cases[index]] = HTMLdata[index].replace(
          currentcases,
          "currentcase=" +
            safeJsonStringify(this.dynamicValidateForm.cases[0].value)
        );
        (casesList as any)[cases[index]] = HTMLdata[index].replace(
          data,
          'data-cases="' + safeJsonStringify(cases) + '"'
        );
      });
      this.SectionDataHTML = HTMLdata;
      if (num == 2) {
        this.$emit("getStudentName", casesList);
      } else {
        this.submitSection(2);
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
          "data-cases": safeJsonStringify(data["data-cases"]),
          id: data.id,
          currentcase: data["data-cases"][0],
        };
      }
      if (DocumentData.name && DocumentData.name == "v-section") {
        const create = writer.createElement(V_SECTION, DocumentData.attributes);
        DocumentData.children.map((item) => {
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
      DocumentData.map((item) => {
        const p = writer.createElement(item.name);
        item.children.map((items, index) => {
          let text = writer.createText(
            items.data || items.name,
            items.attributes
          );
          writer.append(text, p);
          writer.append(p, create);
        });
      });
      return create;
    },
    createSectionInner(writer, parserDom, parentElement) {
      let text = null,
        dom = null;
      if (this.dynamicValidateForm.radio == "applicable") {
        this.dynamicValidateForm.cases = [
          { value: "适用" },
          { value: "不适用" },
        ];
      }
      for (let item of parserDom) {
        if (item.type === "element") {
          // 返回元素属性对象
          let atttibutesList = item.attributes.map((item) => [
            item.key,
            item.value,
          ]);
          atttibutesList = Object.fromEntries([...atttibutesList]);
          // 创建元素
          if (item.tagName === "section") {
            const cases = this.dynamicValidateForm.cases.map(
              (item) => item.value
            );
            atttibutesList["data-cases"] = safeJsonStringify(cases);
            atttibutesList.currentcase =
              this.dynamicValidateForm.cases[0].value;
            dom = writer.createElement(V_SECTION, atttibutesList);
          } else if (item.tagName === "p") {
            dom = writer.createElement("paragraph", atttibutesList);
          } else if (item.tagName === "span") {
            item.children.map((items) => {
              dom = writer.createText(items.content, {
                restrictedEditingException: true,
              });
            });
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
          writer.append(writer.createText(item.content), parentElement);
        }
        // 递归
        if (item.children && item.tagName !== "span") {
          this.createSectionInner(writer, item.children, dom);
        }
      }
      return dom;
    },
    changeRadio(val) {
      this.SectionData = [];
      this.SectionDataHTML = [];
      this.ValidateDeletabl = this.$options.data().ValidateDeletabl;
      this.ValidateSwitchable = this.$options.data().ValidateSwitchable;
      this.ValidateApplicable = this.$options.data().ValidateApplicable;
      if (val == "deletable") {
        this.dynamicValidateForm.cases = this.ValidateDeletabl.cases;
        this.dynamicValidateForm.type = this.ValidateDeletabl.radio;
      }
      if (val == "switchable") {
        this.dynamicValidateForm.cases = this.ValidateSwitchable.cases;
        this.dynamicValidateForm.type = this.ValidateSwitchable.radio;
      }
      if (val == "applicable") {
        this.dynamicValidateForm.cases = this.ValidateApplicable.cases;
        this.dynamicValidateForm.type = this.ValidateApplicable.radio;
      }
      if (
        this.dynamicValidateForm.cases.length !== 0 &&
        this.dynamicValidateForm.cases[0].value !== ""
      ) {
        if (val == "applicable") {
          ElMessage({
            message: "适用/不适用类型只能有两个case。",
            type: "warning",
          });
          const model = (window as any).devEditor.model;
          const selection: selection = model.document.selection;
          const elementSection: any = Array.from(
            selection.getSelectedBlocks()
          )[0].parent;
          const currentcase = elementSection.getAttribute("currentcase");
          // this.CheckDomain(2)
        }
      } else {
        if (val == "applicable") {
          this.dynamicValidateForm.cases = [
            { value: "适用" },
            { value: "不适用" },
          ];
        } else if (val == "deletable") {
          ElMessage({
            message: "可删除类型只能有一个case。",
            type: "warning",
          });
        }
      }
    },
    applicableClick(domain) {
      console.log(domain);
      this.submitForm(domain, this.dynamicValidateForm);
    },
  },
};
</script>
<style lang="less" scoped>
.hidden-item {
  display: none;
}
.extendBackground {
  background-color: rgba(255, 169, 77, 0.2) !important;
}
.ck-editor {
  width: 700px !important;
}
:deep(.el-form-item__content) {
  justify-content: space-between;
  flex-wrap: nowrap;
  > .el-button--primary {
    border-radius: 0px !important;
    /* background: #c3bdbd; */
    /* color: #0b0404; */
    border-right: 1px solid #f4efef;
    margin-left: 0px !important;
  }
}
.el-divider--vertical {
  top: 8px;
}
</style>
