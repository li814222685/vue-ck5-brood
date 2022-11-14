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
          message: 'Please input email address',
          trigger: 'blur',
        },
        {
          message: 'Please input correct email address',
          trigger: ['blur', 'change'],
        },
      ]"
    >
      <el-input v-model="dynamicValidateForm.modelName" />
    </el-form-item>
    <el-form-item
      prop="radio"
      :rules="[
        {
          required: true,
          trigger: 'blur',
        }
      ]"
      label="type">
      <el-radio-group v-model="dynamicValidateForm.radio" @change="changeRadio">
        <el-radio :label="1">Option A</el-radio>
        <el-radio :label="2">Option B</el-radio>
        <el-radio :label="3">Option C</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-for="(domain, index) in dynamicValidateForm.cases"
      :key="domain"
      :label="'cases' + index"
      :prop="'cases.' + index + '.value'"
      :rules="{
        required: true,
        message: 'cases can not be null',
        trigger: 'blur',
      }"
    >
      <el-input v-model="domain.value" />
      <el-button class="mt-2" type="primary" @click.prevent="submitForm(domain,dynamicValidateForm)"
        >submit</el-button>
      <el-button class="mt-2" @click.prevent="removeDomain(domain)"
        >Delete</el-button>
      <el-button class="mt-2" @click.prevent="CheckDomain(domain)"
        >CheckSection</el-button>
      <el-button class="mt-2" @click.prevent="CheckTopping(domain)"
        >Topping</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitSection()">SubmitSection</el-button>
      <el-button @click="addDomain">New cases</el-button>
      <el-button @click="resetForm()">Reset</el-button>
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()
const dynamicValidateForm = reactive<{
  cases: DomainItem[]
  modelName: string
  radio: number
}>({
  cases: [
    {
      value: '',
    },
  ],
  modelName:'',
  radio:1,
})

interface DomainItem {
  value: string
}

const removeDomain = (item: DomainItem) => {
  const index = dynamicValidateForm.domains.indexOf(item)
  if (index !== -1) {
    dynamicValidateForm.domains.splice(index, 1)
  }
}

const addDomain = () => {
  dynamicValidateForm.cases.push({
          value: '',
        });
  console.log(123)
  console.log(dynamicValidateForm)
}

const submitForm = (item,formEl) => {
  const index = dynamicValidateForm.cases.indexOf(item)
      const userFormData = JSON.parse(JSON.stringify(formEl))
      if(!userFormData.modelName || userFormData.modelName == "") return;
      if(userFormData.cases.some(item=>!item.value || item.value == "" )) return;
      if (!userFormData) return;
      let cases = []
      userFormData.cases.map(item=>{
        cases.push(item.value)
      })
      let modelData = {
        type:userFormData.radio,
        modelname:userFormData.modelName,
        "data-cases":cases,
        id: "section" + userFormData.cases.length,
      } 
      const model = (window as any).devEditor.model;
      const selection = model.document.selection;
      const parent = Array.from( selection.getSelectedBlocks() )[0].parent;
      const blocks = Array.from(Array.from(selection.getSelectedBlocks())[0].parent.getChildren());

      const DocumentData = []
      blocks.map(item=>{
        DocumentData.push(item.toJSON())
      })
      model.change(writer => {
        // 通过section 范围获取到范围内的 element
        const firstRange = selection.getFirstPosition();
        const LastRange = selection.getLastPosition();
        let elementRange = writer.createRange(firstRange, LastRange);
        const element = model.schema.getLimitElement(elementRange);
        const range = writer.createRangeOn(element);
        // 删除section
        writer.remove(range)
        // 执行创建section元素并添加子元素
        const sectionElement =   this.createSectionElement(writer,DocumentData,modelData)
        console.log(JSON.parse(JSON.stringify(this.SectionData)))
        console.log(this.SectionData)
        this.SectionData[index] = (JSON.parse(JSON.stringify(sectionElement)))
        model.insertContent(sectionElement, model.document.selection,'on')
        let idname = "section" + userFormData.cases.length
        setTimeout(() => {
          // 存储section的html
          let set = document.getElementById(idname) 
          this.SectionDataHTML[index] = (set.outerHTML)
          console.log(this.SectionDataHTML)
        },1000)
    });

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