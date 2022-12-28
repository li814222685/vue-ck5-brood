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
  '<p>你的姓名：Lee nickName:<span class="restricted-editing-exception">Lee</span></p><figure class="table"><table><tbody><tr><td>&nbsp;</td><td style="background-color:#cccacab3;" ismetagroup="true">&nbsp;</td><td>&nbsp;</td><td style="background-color:#cccacab3;" ismetagroup="true">&nbsp;</td><td>&nbsp;</td></tr><tr><td style="background-color:#cccacab3;" ismetagroup="true" turplename="321">&nbsp;</td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">1</span></td><td style="background-color:rgba(255, 169, 77, 0.2);" type="select" optionlist="[{&quot;label&quot;:&quot;321&quot;,&quot;value&quot;:&quot;321&quot;},{&quot;label&quot;:&quot;456&quot;,&quot;value&quot;:&quot;456&quot;}]"><span class="restricted-editing-exception">321</span></td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">3</span></td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">4</span></td></tr><tr><td style="background-color:#cccacab3;" ismetagroup="true">&nbsp;</td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">5</span></td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">6</span></td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">7</span></td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">8</span></td></tr><tr><td>&nbsp;</td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">9</span></td><td>10</td><td style="background-color:rgba(255, 169, 77, 0.2);"><span class="restricted-editing-exception">11</span></td><td>12</td></tr></tbody></table></figure>'
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
