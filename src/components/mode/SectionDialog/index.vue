<template>
  <el-dialog v-model="props.visible" title="模块设置" width="30%">
    <el-form ref="sectionForm" label-position="right" label-width="80px" :model="formData">
      <el-form-item label="模块名称">
        <el-input v-model="formData.modelName"></el-input>
      </el-form-item>
      <el-form-item label="Type">
        <el-radio-group v-model="formData.type">
          <el-radio v-for="(item, index) in typeRadio" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Case">
        <el-row v-for="(item, index) in formData.cases" :key="index" :gutter="20">
          <el-col :span="20"><el-input v-model="item.caseName"></el-input></el-col>
          <el-col :span="4"><el-button type="primary" :icon="Delete" text @click="deleteCase(index)" /></el-col>
        </el-row>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addCase">添加</el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="changeVisible()">取消</el-button>
        <el-button type="primary" @click="submitFormInfo()"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import type { FormInstance } from "element-plus";
import { Delete, Edit, Search, Share, Upload } from "@element-plus/icons-vue";
import { reactive, ref, toRaw, toRefs } from "vue";

export interface Case {
  caseName: string;
  //   caseValue: string;
}
export interface radioGroup {
  label: string;
  value: string;
}
export interface Section {
  modelName: string;
  type: string;
  cases: Case[];
};

interface SectionDialogProps {
  visible: boolean;
  formData: Section;
  typeRadio: radioGroup[];
  changeVisible: () => void;
  InsertSectionCommand: (attr: Section[]) => void;

}
const emit = defineEmits(["getFormValue"]);
const props = defineProps<SectionDialogProps>();
const state = reactive<SectionDialogProps>(props);
const { formData, typeRadio } = toRefs(state);
const submitFormInfo = () => {
  try {
    props.InsertSectionCommand(toRaw(formData.value));
    // console.log(toRaw(formData.value));
    props.changeVisible();
    // emit("getFormValue", toRaw(formData.value));
  } catch (error) {
    console.log(error);
  }
};


const addCase = () => {
  formData.value.cases.push({ caseName: "" });
};

const deleteCase = (index: number) => {
  formData.value.cases.splice(index, 1);
};
</script>
<style lang="less" scoped></style>
