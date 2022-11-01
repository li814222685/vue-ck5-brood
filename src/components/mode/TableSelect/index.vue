<template>
  <el-select-v2
    v-model="value2"
    :options="options"
    placeholder="Please select"
    class="table-select"
    :style="{
      width: selectPosition?.width - 2 + 'px',
      paddingTop: 3 + 'px',
      // height: selectPosition?.height + 'px',
      top: selectPosition?.top + 'px',
      left: selectPosition?.left + 1 + 'px',
    }"
    allow-create
    filterable
    clearable
  />
  <p>值:::{{ selectPosition }}</p>
</template>
<script setup lang="ts">
import { Position } from "@vueuse/core";
import { onMounted, reactive, ref, watch } from "vue";
import { emitter, SET_TABLE_SELECT_POSITION } from "../mitt";

class SelectAxixsInfo {
  left = 0;
  top = 0;
  width = 0;
  height = 0;
}

const selectPosition = ref(new SelectAxixsInfo());

onMounted(() => {
  emitter.on(SET_TABLE_SELECT_POSITION, updateItem);
});

const updateItem = (axixs: SelectAxixsInfo) => {
  console.log(
    "%c🍉Lee%cline:31%caxixs",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(227, 160, 93);padding:3px;border-radius:2px",
    axixs
  );
  // const res = Math.floor(axixs.top);

  selectPosition.value = axixs;
};

const value2 = ref();
const initials = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

const options = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `Option ${idx + 1}`,
  label: `${initials[idx % 10]}${idx}`,
}));
</script>
<style lang="less" scoped>
.table-select {
  position: fixed;
  z-index: 999;
  border: none;
  /deep/ .el-select-v2__wrapper {
    border: none !important;
    border-radius: 0;
  }
}
.table-select :focus {
  outline: none;
}
</style>
