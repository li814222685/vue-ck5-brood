<template>
  <el-dialog destroy-on-close="true" v-model="props.visible" title="设置Turple" width="40%">
    <el-form ref="ruleFormRef" :rules="rules" :model="form" label-width="120px">
      <el-form-item label="元组名称" prop="turpleName">
        <el-input v-model="form.turpleName" />
      </el-form-item>
      <el-form-item label="设为Turple" prop="isTurple">
        <el-switch v-model="form.isTurple" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="changeVisible">取消</el-button>
        <el-button type="primary" @click="submit(ruleFormRef)"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { onMounted, onUpdated, reactive, ref, toRaw } from "vue";
import _ from "lodash";
import type { FormInstance, FormRules } from "element-plus";
import Element from "@ckeditor/ckeditor5-engine/src/view/element";

interface SetTurpleDialogProps {
  visible: boolean;
  changeVisible: () => void;
  anchorCellEle: null | Element;
}

const props = defineProps<SetTurpleDialogProps>();
const ruleFormRef = ref<FormInstance>();

const initState = () => ({
  turpleName: "",
  isTurple: false,
});

const form = reactive(initState());
const rules = reactive<FormRules>({
  turpleName: [{ required: true, message: "请输入元组名称！", trigger: "blur" }],
  isTurple: [{ required: true }],
});

onUpdated(() => {
  if (props.visible) {
    const isHasMetaGroup = props.anchorCellEle?.getAttribute("isMetaGroup");

    form.isTurple = Boolean(isHasMetaGroup);
    form.turpleName = props.anchorCellEle?.getAttribute("turpleName") as string;
  }
});

const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const editor = (window as any).devEditor;
      const editingView = editor.editing.view;
      const mapper = editor.editing.mapper;
      const { anchorCellEle } = props;
      const anchorEle = toRaw(anchorCellEle);
      const anchorEleByView = mapper.toViewElement(anchorEle);

      //在View 层增加锚点背景样式 和 属性 /删除锚点样式 和 属性
      editingView.change(writer => {
        if (form.isTurple) {
          writer.setStyle({ "background-color": "#cccacab3" }, anchorEleByView);
          writer.setAttribute("isMetaGroup", true, anchorEleByView);
          writer.setAttribute("turpleName", form.turpleName, anchorEleByView);
        } else {
          writer.setStyle({ "background-color": "#eeeeeeb3" }, anchorEleByView);
          writer.removeAttribute("isMetaGroup", anchorEleByView);
          writer.removeAttribute("turpleName", anchorEleByView);
        }
      });
      //在Model 层 增加/删除 属性

      editor.model.change(writer => {
        if (form.isTurple) {
          writer.setAttribute("isMetaGroup", true, anchorEle);
          writer.setAttribute("turpleName", form.turpleName, anchorEle);
        } else {
          writer.removeAttribute("isMetaGroup", anchorEle);
          writer.removeAttribute("turpleName", anchorEle);
        }
        writer.setSelection(null);
      });
      Object.assign(form, initState());

      props.changeVisible();
    } else {
      console.log("error submit!", fields);
    }
  });
};
</script>
<style lang="less" scoped></style>
