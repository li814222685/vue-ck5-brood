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
  '<p>你的姓名：Lee nickName:<span class="restricted-editing-exception">Lee</span></p><p>&nbsp;</p><figure class="table"><table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td style="background-color:rgba(255, 169, 77, 0.2);" type="select" optionlist="[{&quot;label&quot;:&quot;锚点&quot;,&quot;value&quot;:&quot;锚点&quot;},{&quot;label&quot;:&quot;测试&quot;,&quot;value&quot;:&quot;测试&quot;}]"><span class="restricted-editing-exception">锚点</span></td><td>312312321</td></tr><tr><td>&nbsp;</td><td>测试</td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">测试</span></td></tr></tbody></table></figure><p>&nbsp;</p>'
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
  // max-height: 20px !important;

  .ck-editor__editable .restricted-editing-exception {
    background-color: inherit !important;
    border: none !important;
    padding: 0px;
  }
}
.table table tbody :first-child td {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  background-color: #eeeeeeb3;
}
.table table tbody :first-child td:hover {
  background-color: #cccacab3;
}
//去除锚点选中后的 聚焦边框和背景
.table table tbody :first-child td:focus,
.table table tbody tr td:first-child:focus {
  background-color: #cccacab3 !important;
  outline: none !important;
}
.table table tbody tr td:first-child {
  background-color: #eeeeeeb3;
  padding: 0px !important;
  width: 22px;
}
.table table tbody tr td:first-child:hover {
  background-color: #cccacab3;
}
// .table table tbody tr:first-child td {
//   flex: 1;
// }
</style>
