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
      @getStudentName="getStudentName"
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
  `<p>你的姓名：Lee nickName:<span class="restricted-editing-exception">Lee</span></p ><v-section modelName="模块名" type="switch" currentcase="caseA" data-cases=${JSON.stringify(
    ["caseA", "caseB", "caseC", "caseD"]
  )}><p>我只是一个段落</p ><span class="restricted-editing-exception">只是一个可编辑的地方</span></v-section>
    <p>你的姓名：Lee nickName:<span class="restricted-editing-exception">Lee</span></p >`
  // `<p>你的姓名：Lee nickName:<span class="restricted-editing-exception">Lee</span></p >
  //   <p>你的姓名：Lee nickName:<span class="restricted-editing-exception">Lee</span></p >`
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
  console.log(val);
  // htmlData.value = val;
};
</script>
<style scoped>
.container {
  width: 80%;
  margin: 0 auto;
}
</style>
