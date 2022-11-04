<template>
  <span class="btn-model">
    <el-button id="menuBtn" class="menu-btn section-btn" text bg size="small" v-if="props.menuVisible" @click="showList"
      ><el-icon><Operation style="font-weight: bold" /></el-icon
    ></el-button>
  </span>
  <div>
    <el-card class="box-card" v-if="listVisible">
      <div v-for="(item, index) in cases.data" :key="index" class="text item section-menu" @click="chengeCase(item)">
        {{ item }}
        <el-icon v-if="currentCase === item" class="select-case"><Select /></el-icon>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, toRaw, toRefs, watch, nextTick } from "vue";
interface AttributeOption {
  key: string;
  value: string;
}

interface SectionMenuProps {
  positionRange: string[];
  attributsList: AttributeOption[];
  menuVisible: boolean;
}

const props = defineProps<SectionMenuProps>();
const state = reactive<SectionMenuProps>(props);
const { positionRange, attributsList, menuVisible } = toRefs(state);
const emit = defineEmits(["changeCase"]);
let listVisible = ref(false);
let currentCase = ref("");
let cases = reactive({
  data: [],
});
watch(
  positionRange,
  (value: string[]) => {
    nextTick(() => {
      const menuBtn = document.querySelector("#menuBtn");
      if (!menuBtn) return;
      menuBtn.style.left = value[0] - 35 + "px";
      menuBtn.style.top = value[1] - 3 + "px";
    });
  },
  { immediate: true, deep: true }
);
watch(menuVisible, (value: boolean) => {
  if (!value) {
    listVisible.value = false;
  }
});

const showList = () => {
  const attributes = toRaw(attributsList.value);
  for (let i of attributes) {
    if (i.key == "data-cases") {
      cases.data = JSON.parse(i.value);
      if(!currentCase.value) {
        currentCase.value = cases.data[0]
      }
    }
  }
  listVisible.value = true;
  nextTick(() => {
    const menuBtn = document.querySelector(".box-card");
    const range = toRaw(positionRange.value);
    menuBtn.style.left = range[0] - 45 - 100 + "px";
    menuBtn.style.top = range[1] - 3 + "px";
  });
};

const chengeCase = (item: string) => {
  if(currentCase.value != item) {
    emit("changeCase", item);
  }
  currentCase.value = item;
};
</script>
<style lang="less" scoped>
.btn-model {
  // position: relative;
  .menu-btn {
    position: absolute;
  }
}
.box-card {
  width: 100px;
  position: absolute;
  :deep(.el-card__body) {
    padding: 0;
    .item {
      padding: 10px 10px 10px 10px;
      text-align: center;
      &:hover {
        background-color: #f5f7fa;
      }
      .select-case {
        position: absolute;
        right: 10px;
      }
    }
  }
}
</style>
