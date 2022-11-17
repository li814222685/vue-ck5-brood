<template>
  <el-dialog v-model="props.visible" title="下拉选项设置" width="40%">
    <el-table :data="tableData" style="width: 100%" row-key="id">
      <el-table-column prop="label" label="名称">
        <template #default="scope">
          <el-input
            v-if="targetRow == scope.$index"
            v-model="scope.row.label"
            placeholder="Please input"
          />
          <span v-else>{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="value" label="值">
        <template #default="scope">
          <el-input
            v-if="targetRow == scope.$index"
            v-model="scope.row.value"
            placeholder="Please input"
          />
          <span v-else>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template #default="scope">
          <el-button
            v-if="targetRow == scope.$index"
            link
            type="primary"
            size="small"
            @click.prevent="saveRow(scope.$index, scope.row)"
          >
            保存
          </el-button>
          <el-button v-else link type="primary" size="small" @click.prevent="editRow(scope.$index)">
            修改
          </el-button>
          <el-button link type="primary" size="small" @click.prevent="deleteRow(scope.$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button class="mt-4" :icon="Plus" style="width: 100%; margin-top: 20px" @click="onAddItem"
      >添加</el-button
    >
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="changeVisible">取消</el-button>
        <el-button type="primary" @click="submitOptions"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, toRaw, toRefs, onMounted, onUpdated } from "vue";
import { Plus } from "@element-plus/icons-vue";
import Sortable from "sortablejs";
import _ from "lodash";
import { isVisible } from "element-plus/es/utils";

export interface Option {
  label: string | number;
  value: string | number | boolean;
}

interface SelectDialogProps {
  visible: boolean;
  changeVisible: () => void;
  tableData: Option[];
  insertOptionsToSelect: (attr: Option[]) => void;
  needEditElement: null | Element;
}

const props = defineProps<SelectDialogProps>();
const state = reactive<SelectDialogProps>(props);
const { tableData } = toRefs(state);
const targetRow = ref<number>(null);

onUpdated(() => {
  if (props.visible) {
    rowDrop();
  }
});

const deleteRow = (rowIndex: number) => {
  tableData.value.splice(rowIndex, 1);
};

const onAddItem = () => {
  const newOption = { label: "", value: "" };
  console.log(tableData.value);
  tableData.value.push(newOption);
  targetRow.value = tableData.value.length - 1;
};

const editRow = (rowIndex: number) => {
  targetRow.value = rowIndex;
};

const saveRow = (rowIndex: number, rowVal: Option) => {
  const value = toRaw(rowVal);
  tableData.value[rowIndex] = value;
  targetRow.value = null;
};

const rowDrop = () => {
  const tbody = document.querySelector(".el-table__body-wrapper tbody");

  Sortable.create(tbody, {
    onEnd({ newIndex, oldIndex }) {
      console.log(newIndex, oldIndex);
      const originList = tableData.value;
      [originList[oldIndex], originList[newIndex]] = [originList[newIndex], originList[oldIndex]];
    },
  });
};

/** Table Select 提交时的处理逻辑 */
const handleTableSelectLogic = () => {
  if (props.needEditElement) {
    const editor = (window as any).devEditor;
    const model = editor.model;
    const selection = model.document.selection;
    const blocks = editor.model.document.selection.getSelectedBlocks();
    const block = [...blocks][0];

    model.change(writer => {
      const range = writer.createRangeIn(block);
      if (tableData.value[0]?.label) {
        //将option的第一项作为文本的默认值
        const itemRange = model.insertContent(
          writer.createText(tableData.value[0]?.label, { restrictedEditingException: true }),
          range
        );
      }
    });
  }
};

const submitOptions = () => {
  try {
    handleTableSelectLogic();
    props.insertOptionsToSelect(toRaw(tableData.value).map(item => _.omit(item, "id")));
    props.changeVisible();
  } catch (error) {
    console.log(error);
  }
};
</script>
<style lang="less" scoped></style>
