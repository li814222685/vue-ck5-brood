<template>
        <el-form
    ref="formRef"
    :model="dynamicValidateForm"
    label-width="120px"
    class="demo-dynamic"
  >
    <el-form-item
      prop="modelName"
      label="modelName"
      :rules="[
        {
          required: true,
          message: 'Please input modelName address',
          trigger: 'blur',
        },
        {
          message: 'Please input correct modelName address',
          trigger: ['blur', 'change'],
        },
      ]"
    >
      <el-input v-model="dynamicValidateForm.modelName" />
    </el-form-item>
    <el-form-item
      prop="radio"
      label="type">
      <el-radio-group v-model="dynamicValidateForm.radio" @change="clickRadio">
        <el-radio :label="1">Option A</el-radio>
        <el-radio :label="2">Option B</el-radio>
        <el-radio :label="3">Option C</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-for="(domain, index) in dynamicValidateForm.domains"
      :key="domain.key"
      :label="'Domain' + index"
      :prop="'domains.' + index + '.value'"
      :rules="{
        required: true,
        message: 'domain can not be null',
        trigger: 'blur',
      }"
    >
      <el-input v-model="domain.value" />
      <el-button class="mt-2" @click.prevent="removeDomain(domain)"
        >Delete</el-button
      >
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm(formRef)">Submit</el-button>
      <el-button @click="addDomain">New domain</el-button>
      <el-button @click="resetForm(formRef)">Reset</el-button>
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()
const dynamicValidateForm = reactive<{
  domains: DomainItem[]
  modelName: string
  radio: number
}>({
  domains: [
    {
      key: 1,
      value: '',
    },
  ],
  modelName:'',
  radio:1,
})

interface DomainItem {
  key: number
  value: string
}

const removeDomain = (item: DomainItem) => {
  const index = dynamicValidateForm.domains.indexOf(item)
  if (index !== -1) {
    dynamicValidateForm.domains.splice(index, 1)
  }
}

const addDomain = () => {
  dynamicValidateForm.domains.push({
    key: Date.now(),
    value: '',
  })
}

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!')
      return false
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

// dynamicValidateForm:{
//   domains: [
//     {
//       key: 1,
//       value: '',
//     },
//   ],
//   modelName: '',
//   radio:1,
// }
</script>