<template>
  <div>
    <el-button type="primary" @click="exportData" plain>导出</el-button>
    <br />
    <br />
    <div class="content">
      <div id="devEditor"></div>
      <SectionForm 
      :form-data="dynamicValidateForm"
      :sectionData="sectionData"
      @getStudentName="getStudentName"
      ref="refSectionForm"
      />
      <!-- <el-form
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
      </el-form> -->
    </div>
    <!-- <SelectDialog
      :visible="dialogVisible"
      :change-visible="swtichModal"
      :table-data="selectedOptions"
      :insert-options-to-select="insertOptionsToSelect"
    /> -->
 
  </div>
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
import SectionForm from "./SectionForm/index.vue";
import { COMMAND_NAME__INSERT_OPTIONS } from "../../plugins/controlsMenu/constant";
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import "../../plugins/theme/style-setion.css";
import { toRaw , ref,nextTick,getCurrentInstance  } from "vue";
export default {
  components: { SelectDialog , SectionForm},
  props: ["htmlData", "nowMode", "onchange", "sectionData"],
  data() {
    return {
      editor: {},
      anchor: null,
      deposit: {},
      dialogVisible: false,
      selectedOptions: [], //当前选中select 有哪些options，用来将options传递到弹窗表格内
      attr_id: 1,
      SectionData: [], // element元素
      SectionDataHTML: [], // html文本
    };
  },
  mounted() {
    console.log(this.sectionData)
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
    getStudentName(data){
      this.$emit("getStudentName", data);
    },
  },

  /** vue3获取 vue2实例 */
  setup(prop,{emit}){
    let { proxy } :any = getCurrentInstance();
    const refSectionForm = ref();
    const onParagraph = (e)=>{
      nextTick(() => {
        if (refSectionForm.value) {
          console.log('refSectionForm.value',refSectionForm.value)
          refSectionForm.value.onParagraphs(proxy.sectionData);
        }
      })
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
    };
    const exportData = ()=> { 
      proxy.onchange((window as any).devEditor.getData());
      nextTick(() => {
        if (refSectionForm.value) {
          console.log('refSectionForm.value',refSectionForm.value)
          refSectionForm.value.submitSection();
        }
      })
    };
    return {
      exportData,
      onParagraph,
      refSectionForm
    }
  }
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
.button-list {
  padding-left: 5px;
  background-color: #f5f7fa;
  position: relative;
  .el-button {
    background-color: #f5f7fa;
    &:focus,
    &:hover {
      color: #606266;
      border-color: #dcdfe6;
    }
  }
  .el-button + .el-button {
    margin-left: 4px;
  }
}
.applicable-check {
  position: absolute;
  right: 0;
  top: -15px;
}
</style>
