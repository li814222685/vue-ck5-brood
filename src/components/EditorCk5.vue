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

const nowMode = ref(EditorMode.Restrict);
const htmlData = ref(
  '<p><span class="restricted-editing-exception">周一</span></p><figure class="table"><table><tbody><tr><td>&nbsp;</td><td style="background-color:#cccacab3;" ismetagroup="true">&nbsp;</td><td>&nbsp;</td><td style="background-color:#cccacab3;" ismetagroup="true">&nbsp;</td></tr><tr><td style="background-color:#cccacab3;" ismetagroup="true">&nbsp;</td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">1</span></td><td style="background-color:rgba(255, 169, 77, 0.2);" type="select" optionlist="[{&quot;label&quot;:&quot;Mon&quot;,&quot;value&quot;:&quot;Mon&quot;},{&quot;label&quot;:&quot;Tue&quot;,&quot;value&quot;:&quot;Tue&quot;},{&quot;label&quot;:&quot;Wed&quot;,&quot;value&quot;:&quot;Wed&quot;},{&quot;label&quot;:&quot;Thu&quot;,&quot;value&quot;:&quot;Thu&quot;},{&quot;label&quot;:&quot;Fri&quot;,&quot;value&quot;:&quot;Fri&quot;},{&quot;label&quot;:&quot;Sat&quot;,&quot;value&quot;:&quot;Sat&quot;},{&quot;label&quot;:&quot;Sun&quot;,&quot;value&quot;:&quot;Sun&quot;},{&quot;label&quot;:&quot;Kkk&quot;,&quot;value&quot;:&quot;Kkk&quot;},{&quot;label&quot;:&quot;do Some&quot;,&quot;value&quot;:&quot;Do some&quot;},{&quot;label&quot;:&quot;lexvy&quot;,&quot;value&quot;:&quot;levy&quot;},{&quot;label&quot;:&quot;gun&quot;,&quot;value&quot;:&quot;gun&quot;}]"><span class="restricted-editing-exception">Mon</span></td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">3</span></td></tr><tr><td>&nbsp;</td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">4</span></td><td>5</td><td>6</td></tr><tr><td style="background-color:#cccacab3;" ismetagroup="true">&nbsp;</td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">7</span></td><td>8</td><td>9</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table></figure><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>'
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
//锚点选中行的样式
.ck-editor__editable_selected {
  background-color: #e3f1fd !important;
}
// .table table tbody tr:first-child td {
//   flex: 1;
// }
</style>
