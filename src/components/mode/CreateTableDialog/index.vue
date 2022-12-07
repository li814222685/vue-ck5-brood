<template>
  <el-dialog destroy-on-close="true" v-model="props.visible" title="创建Table" width="40%">
    <p>
      表格尺寸：
      <el-input-number size="small" v-model="rowNum" :min="2" :max="10" />
      &nbsp;x&nbsp;
      <el-input-number size="small" v-model="colNum" :min="2" :max="10" />
    </p>
    <p>
      锚点表格：
      <el-checkbox v-model="isNeedAnchor" />
    </p>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="changeVisible">取消</el-button>
        <el-button type="primary" @click="submitOptions"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import _ from "lodash";
import { Editor } from "@ckeditor/ckeditor5-core";
import { columns } from "element-plus/es/components/table-v2/src/common";

interface CreateTableDialogProps {
  visible: boolean;
  changeVisible: () => void;
}

const props = defineProps<CreateTableDialogProps>();
const state = reactive<CreateTableDialogProps>(props);
const rowNum = ref<number>(2);
const colNum = ref<number>(2);
const isNeedAnchor = ref<boolean>(true);

const submitOptions = () => {
  console.log(rowNum.value, colNum.value);
  (window as any).devEditor.execute("insertTable", {
    rows: isNeedAnchor.value ? rowNum.value + 1 : rowNum.value,
    columns: isNeedAnchor.value ? colNum.value + 1 : colNum.value,
  });

  props.changeVisible();
};
</script>
<style lang="less" scoped></style>
