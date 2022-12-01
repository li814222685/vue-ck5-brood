<template>
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
    <el-input 
      v-model="dynamicValidateForm.modelName"
      @focus="inputFocus"
    />
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
      v-model="dynamicValidateForm.type"
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
  <el-col :span="14" class="input-part">
    <el-input
      class="case-input"
      v-model="domain.value"
      :readonly="dynamicValidateForm.type == 'applicable'"
      @focus="
        () => {
          dynamicValidateForm.type == 'applicable'
            ? submitForm(domain, dynamicValidateForm)
            : '';
            inputFocus()
        }
      "
      @change="submitForm(domain, dynamicValidateForm)"
      v-if="dynamicValidateForm.type !== 'applicable'"
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
              dynamicValidateForm.type == 'applicable'
            "
            :icon="CopyDocument"
            @click="addDomain"
          />
        </el-tooltip>
      </template>
    </el-input>
    <el-row v-if="dynamicValidateForm.type == 'applicable'">
      <span>{{ domain.value }}</span>
      <el-divider direction="vertical" />
      <el-button @click="submitForm(domain, dynamicValidateForm)" plain>保存</el-button>
    </el-row>
  </el-col>
  <el-col :span="10" class="button-list">
    <el-tooltip
      class="box-item"
      effect="dark"
      content="删除"
      placement="top-start"
      v-if="dynamicValidateForm.type !== 'applicable'"
    >
      <el-button
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
        :class="
          dynamicValidateForm.type !== 'applicable'
            ? ''
            : 'applicable-check'
        "
        @click.prevent="CheckDomain(domain)"
        :icon="Checked"
      ></el-button>
    </el-tooltip>
    <el-tooltip
      class="box-item"
      effect="dark"
      content="置顶"
      placement="top-start"
      v-if="dynamicValidateForm.type !== 'applicable'"
    >
      <el-button
        @click.prevent="CheckTopping(domain)"
        :icon="Upload"
      ></el-button>
    </el-tooltip>
  </el-col>
  </el-form-item>
</el-form>
</template>
<script lang="ts" setup>
import { reactive, ref , toRaw} from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage } from "element-plus";
import { Upload, Delete, Checked, CopyDocument, SetUp } from "@element-plus/icons-vue";;
import selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import { parse, stringify } from "himalaya";
import { safeJsonStringify, safeJsonParse } from "../../utils";
import { V_SECTION } from "../../../plugins/section/constant";
interface dynamicValidateForm {
  cases: DomainItem[]
  modelName: string
  type: string
}
const props = defineProps<{
  sectionData: any;
}>();
const sectionData: any = ref(props.sectionData)
const emit = defineEmits(["removeDomain","getStudentName"]);
let dynamicValidateForm = reactive<dynamicValidateForm>({
  cases: [
    {
      value: '',
    },
  ],
  modelName:'',
  type:"deletable",
})
const ValidateDeletabl = reactive<dynamicValidateForm>({
    cases: [
      {
        value: "",
      },
    ],
    modelName: "",
    type: "deletable",
  });
const ValidateSwitchable = reactive<dynamicValidateForm>({
    cases: [
      {
        value: "",
      },
    ],
    modelName: "",
    type: "switchable",
  });
const ValidateApplicable = reactive<dynamicValidateForm>({
    cases: [
      {
        value: "适用",
      },
      {
        value: "不适用",
      },
    ],
    modelName: "",
    type: "applicable",
  });
let SectionData = []; // element元素
let SectionDataHTML = []; // html文本
interface DomainItem {
  value: string
}
/** 输入框焦点 */
const inputFocus = () => {
      (window as any).devEditor.ui.focusTracker.isFocused = false;
    };
  /** 删除所选cases */
const removeDomain = (item:DomainItem)=>{
  const index =dynamicValidateForm.cases.indexOf(item);
  if (index !== -1) {
    dynamicValidateForm.cases.splice(index, 1);
    SectionData.splice(index, 1);
    SectionDataHTML.splice(index, 1);
  }
  if (item.value == "") {
  } else {
    setTimeout(() => {
      CheckDomain(dynamicValidateForm.cases[0]);
    }, 500);
  }
  emit("removeDomain", {dynamicValidateForm})
}
  /** 增加section的cases */
const addDomain = () =>{
  if (
    dynamicValidateForm.type == "applicable" &&
    dynamicValidateForm.cases.length <= 1
  ) {
    dynamicValidateForm.cases.push({
      value: "",
    });
  } else if (
    dynamicValidateForm.type !== "applicable" &&
    dynamicValidateForm.cases.length < 4
  ) {
    if (
      dynamicValidateForm.type == "deletable" &&
      dynamicValidateForm.cases.length == 1
    ) {
      ElMessage({
        message: "可删除类型只能有一个case。",
        type: "warning",
      });
    } else {
      dynamicValidateForm.cases.push({
        value: "",
      });
    }
  } else {
  }
};
 /** 保存当前cases的section数据 */
const submitForm = (item, formEl) => {
  const index = dynamicValidateForm.cases.indexOf(item);
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
    type: userFormData.type,
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
    // 执行创建section元素并添加子元素
    const sectionElement = createSectionElement(
      writer,
      DocumentData,
      modelData
    );
    SectionData[index] = safeJsonParse(
      safeJsonStringify(sectionElement)
    );
    model.insertObject(sectionElement, range);
    writer.setSelectionFocus(range.end, "on");
    let idname = "section" + userFormData.cases.length;
    setTimeout(() => {
      // 存储section的html
      let set = document.getElementById(idname);
      SectionDataHTML[index] = set.outerHTML;
      console.log(SectionDataHTML)
    }, 1000);
  });
};
/** 提交当前modelname所属的section数据 */
const submitSection = (num?: number) => {
  console.log(111)
  if (
    dynamicValidateForm.type == "applicable" &&
    dynamicValidateForm.cases.length > 2
  ) {
    ElMessage({
      message: "适用/不适用类型只能有两个case。",
      type: "warning",
    });
    return;
  }
  const HTMLdata = safeJsonParse(safeJsonStringify(SectionDataHTML));
  const cases = dynamicValidateForm.cases.map((item) => item.value);
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
        safeJsonStringify(dynamicValidateForm.cases[0].value)
    );
    (casesList as any)[cases[index]] = HTMLdata[index].replace(
      currentcases,
      "currentcase=" +
        safeJsonStringify(dynamicValidateForm.cases[0].value)
    );
    (casesList as any)[cases[index]] = HTMLdata[index].replace(
      data,
      'data-cases="' + safeJsonStringify(cases) + '"'
    );
  });
  SectionDataHTML = HTMLdata;
  if (num == 2) {
    emit("getStudentName", casesList);
  } else {
    submitSection(2);
  }
};
/** 切换type类型 */
const changeRadio = (val) => {
      SectionData = [];
      SectionDataHTML = [];
      // ValidateDeletabl = $options.data().ValidateDeletabl;
      // ValidateSwitchable = $options.data().ValidateSwitchable;
      // ValidateApplicable = $options.data().ValidateApplicable;
      if (val == "deletable") {
        dynamicValidateForm.cases = ValidateDeletabl.cases;
        dynamicValidateForm.type = ValidateDeletabl.type;
      }
      if (val == "switchable") {
        dynamicValidateForm.cases = ValidateSwitchable.cases;
        dynamicValidateForm.type = ValidateSwitchable.type;
      }
      if (val == "applicable") {
        dynamicValidateForm.cases = ValidateApplicable.cases;
        dynamicValidateForm.type = ValidateApplicable.type;
      }
      if (
        dynamicValidateForm.cases.length !== 0 &&
        dynamicValidateForm.cases[0].value !== ""
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
          // CheckDomain(2)
        }
      } else {
        if (val == "applicable") {
          dynamicValidateForm.cases = [
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
    };
 /** 置顶当前选中的section */
const CheckTopping = (item) => {
  const index = dynamicValidateForm.cases.indexOf(item);
  let data = SectionData;
  let datas = dynamicValidateForm.cases;
  let datass = SectionDataHTML;
  data.map((items, indexs) => {
    if (index == indexs) {
      data.unshift(data.splice(indexs, 1)[0]);
      datas.unshift(datas.splice(indexs, 1)[0]);
      datass.unshift(datass.splice(indexs, 1)[0]);
    }
  });
  CheckDomain(item);
};
 /** 切换当前选中cases的section */
const CheckDomain = (item) => {
  console.log(sectionData)
  if (item.value == "") {
    return false;
  }
  const index = item == 2 ? 0 : dynamicValidateForm.cases.indexOf(item);
  let SectionDataHTMLCopy = SectionDataHTML[index];
  console.log(SectionDataHTMLCopy)
  const parserSection = parse(SectionDataHTMLCopy);
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
    const newElement = createSectionInner(
      writer,
      parserSection,
      null,
    );
    const newRange = model.insertObject(newElement, range);
    writer.setSelectionFocus(range.end, "on");
  });
}
 /** 根据html文本创建元素 */
const createSectionInner = (writer, parserDom, parentElement) => {
  let text = null,
    dom = null;
  if (dynamicValidateForm.type == "applicable") {
    dynamicValidateForm.cases = [
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
        const cases = dynamicValidateForm.cases.map(
          (item) => item.value
        );
        atttibutesList["data-cases"] = safeJsonStringify(cases);
        atttibutesList.currentcase =
          dynamicValidateForm.cases[0].value;
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
      createSectionInner(writer, item.children, dom);
    }
  }
  return dom;
};
/**
 *
 * @param writer
 * @param DocumentData 创建section所需的元素
 * @param data section属性参数
 */
const createSectionElement = (writer: Writer, DocumentData, data) => {
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
};
 /** section选中效果 */
const onParagraphs = (e) => {
  const model = (window as any).devEditor.model;
  const selection: selection = model.document.selection;
  const elementSection: any = Array.from(selection.getSelectedBlocks())[0].parent;
  const modelname = elementSection.getAttribute("modelname");
  const cases = elementSection.getAttribute("data-cases");
  const type = elementSection.getAttribute("type");
  if (dynamicValidateForm.modelName == "") {
    if (cases && safeJsonParse(cases)) {
      if (dynamicValidateForm.cases[0].value == "") {
        dynamicValidateForm.cases.splice(0, 1);
      }
      safeJsonParse(cases).map((item, index) => {
        dynamicValidateForm.cases.push({ value: item });
      });
      dynamicValidateForm.modelName = modelname;
      dynamicValidateForm.type = type;
    }
  }
  if (elementSection.name == V_SECTION) {
    const data = toRaw(e);
    for (let key in data) {
      SectionDataHTML.push(data[key]);
    }
  }
};


/** vue2调用vue3 需要抛出方法  defineExpose*/
defineExpose({
  submitSection,
  onParagraphs
})
</script>
<style lang="less" scoped>
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