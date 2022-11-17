<template>
  <span class="btn-model">
    <el-button id="menuBtn" class="menu-btn section-btn" text bg size="small" v-if="props.menuVisible" @click="showList"
      ><el-icon><Operation style="font-weight: bold" /></el-icon
    ></el-button>
  </span>
  <div>
    <el-card class="box-card" v-if="data.listVisible">
      <div v-for="(item, index) in data.cases" :key="index" class="text item section-menu" @click="chengeCase(item)">
        {{ item }}
        <el-icon v-if="data.currentCase === item && data.casetype !== 'deletable'" class="select-case"><Select /></el-icon>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, toRaw, toRefs, watch, nextTick } from "vue";
import _ from "lodash";
import { safeJsonStringify, safeJsonParse } from "../../utils";
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
const data = reactive({
  currentCase: ref(""),
  casetype: ref(""),
  listVisible: ref(false),
  deleteCase: reactive(["删除"]),
  applyCase: reactive(["适用", "不适用"]),
  cases: reactive([]),
});
watch(
  positionRange,
  (value: string[]) => {
    nextTick(() => {
      const menuBtn = <HTMLImageElement>document.querySelector("#menuBtn");
      if (!menuBtn) return;
      menuBtn.style.left = <any>value[0] - 35 + "px";
      menuBtn.style.top = <any>value[1] - 3 + "px";
    });
  },
  { immediate: true, deep: true }
);
watch(menuVisible, (value: boolean) => {
  if (!value) {
    data.listVisible = false;
  }
});

const showList = () => {
  const attributes = toRaw(attributsList.value);
  data.currentCase = attributes.filter(item => item.key == "currentcase")[0].value;
  data.casetype = attributes.filter(item => item.key == "type")[0].value;
  if (data.casetype == "deletable") {
    data.cases = data.deleteCase;
  } else if (data.casetype == "applicable") {
    data.cases = data.applyCase;
  } else {
    data.cases = safeJsonParse(_.unescape(attributes.filter(item => item.key == "data-cases")[0].value));
  }
  data.currentCase = !data.currentCase ? data.cases[0] : data.currentCase;
  data.listVisible = true;
  nextTick(() => {
    const menuBtn = <HTMLImageElement>document.querySelector(".box-card");
    const range = toRaw(positionRange.value);
    menuBtn.style.left = <any>range[0] - 45 - 100 + "px";
    menuBtn.style.top = <any>range[1] - 3 + "px";
  });
};

const chengeCase = (item: string) => {
  if (data.currentCase != item || item === "删除") {
    emit("changeCase", {
      caseName: item,
      currentCase: data.currentCase,
    });
  }
  data.currentCase = item;
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
