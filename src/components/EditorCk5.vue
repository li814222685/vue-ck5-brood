<template>
  <div class="container">
    <el-radio-group v-model="nowMode" class="ml-4">
      <el-radio :label="EditorMode.Normal" size="large">编辑模式</el-radio>
      <el-radio :label="EditorMode.Restrict" size="large">模版模式</el-radio>
    </el-radio-group>
    <NormalCK v-if="nowMode === EditorMode.Normal" :htmlData="htmlData" :onchange="changeHtmlData" :nowMode="nowMode" @getStudentName="getStudentName" />
    <RestrictCK v-else :htmlData="htmlData" :sectionData="sectionData" :onchange="changeHtmlData" :nowMode="nowMode" />
  </div>
</template>
<style></style>

<script setup lang="ts">
import RestrictCK from "./mode/RestrictCK.vue";
import NormalCK from "./mode/NormalCK.vue";

import { onUpdated, ref, toRaw } from "vue";

enum EditorMode {
  Normal = "normal",
  Restrict = "restrict",
}
let sectionData = ref("");

const nowMode = ref(EditorMode.Normal);
const htmlData = ref(
  // `<p>你的姓名：Lee nickName:<span class="restricted-editing-exception">Lee</span></p ><v-section modelName="模块名" type="switch" currentcase="caseA" data-cases=${JSON.stringify(
  //   ["caseA", "caseB", "caseC", "caseD"]
  // )}><p>我只是一个段落<span class="restricted-editing-exception">只是一个可编辑的地方</span></p ></v-section>
  //   <p>你的姓名：Lee nickName:<span class="restricted-editing-exception">Lee</span></p >`
  //
  `<p>【声明】</p >
    <p>公司控股股东、实际控制人、董事、监事、高级管理人员保证本报告所载资料不仔在任何虚假记载、误导性陈述或者重大遗漏，
    并对其内容的真实性、准确性和完整性承担个别及连带责任。</p >
    <p>公司负责人韩勇、主管会计工作负责人段颖茹及会计机构负责人(会计主管人员)段颖茹保证年度报告中财务报告的真实、准确、完整。</p >
    <p><span class="restricted-editing-exception">XXX</span>对公司出具了<span class="restricted-editing-exception">XXX</span>的审计报告。</p >`
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
const getStudentName = (val: string) => {
  // console.log(val);
  sectionData.value = val;
  console.log(sectionData, toRaw(sectionData.value));
  // htmlData.value = val;
};
</script>
<style scoped>
.container {
  width: 80%;
  margin: 0 auto;
}
</style>
