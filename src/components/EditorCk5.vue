<template>
  <div class="container">
    <el-radio-group v-model="nowMode" class="ml-4">
      <el-radio :label="EditorMode.Normal" size="large">编辑模式</el-radio>
      <el-radio :label="EditorMode.Restrict" size="large">模版模式</el-radio>
    </el-radio-group>
    <NormalCK
      v-if="nowMode === EditorMode.Normal"
      :htmlData="htmlData"
      :onchange="changeHtmlData"
      :nowMode="nowMode"
    />
    <RestrictCK v-else :htmlData="htmlData" :onchange="changeHtmlData" :nowMode="nowMode" />
  </div>
</template>
<style></style>

<script setup lang="ts">
import RestrictCK from "./mode/RestrictCK.vue";
import NormalCK from "./mode/NormalCK.vue";

import { onUpdated, ref } from "vue";

enum EditorMode {
  Normal = "normal",
  Restrict = "restrict",
}

const nowMode = ref(EditorMode.Normal);
const htmlData = ref(
  '<p>你的姓名：Lee nickName:<span class="restricted-editing-exception">Lee</span></p><p>&nbsp;</p><p>&nbsp;</p><figure class="table"><table><tbody><tr><td>🌞</td><td>🌛</td><td>🌟</td><td>😈</td><td>💻</td></tr><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr><tr><td>3312213123123216</td><td>712321312321321</td><td>8321312312</td><td>12331231231</td><td>321332131232112</td></tr><tr><td>32</td><td>231</td><td>312</td><td>3213</td><td>2313</td></tr><tr><td>312321</td><td>321</td><td>312</td><td>3123</td><td>321312</td></tr></tbody></table></figure><p>&nbsp;</p>'
);
const { value: editorMode } = nowMode;

onUpdated(() => {
  const { value: editorMode } = nowMode;
  console.log(editorMode);
});

const changeHtmlData = (val: string) => {
  console.log(val);
  htmlData.value = val;
};
</script>
<style lang="less">
.container {
  width: 80%;
  margin: 0 auto;
}
//cover CK5 table 的宽度 和 单元格不再会撑开table
figure {
  width: 100%;
  max-width: 100%;
  table {
    table-layout: fixed;
  }
}
.restricted-cell-bgColor {
  background-color: rgba(255, 169, 77, 0.2) !important;
}
tr {
  .ck-editor__editable .restricted-editing-exception {
    background-color: inherit !important;
    border: none !important;
    padding: 0px;
  }
}
</style>
