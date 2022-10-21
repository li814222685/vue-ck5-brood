# vue-ck5-brood



## 只是一个🐣DEMO

### FrameWork：Vue3 + Ts + CKEditor5

> 目前项目已经引入了CK5 官方 部分核心（"@types/ckeditor__ckeditor5-engine"）的Types包，已经可以直接引入使用了！

```typescript
// src/plugins/controlsMenu/util
import { Element } from "@ckeditor/ckeditor5-engine";
import Selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import { CUSTOM_PROPERTY__SELECT } from "./constant";

/** 获取选中的控件 */
export function getSelectedWidget(selection: Selection) {
  const viewElement = selection.getSelectedElement();
  console.log(viewElement);
  if (viewElement && isControls(viewElement)) {
    return viewElement;
  }
  return null;
}
/** 视图元素是否为自定义控件 */
const isControls = (viewElement: Element): boolean => {
  return viewElement.getAttribute(CUSTOM_PROPERTY__SELECT) as boolean;
};

```



### CK5 插件开发结构规范（可直接复制后进行改造）：

```js
── src
│   ├── App.vue
│   ├── components
│   ├── main.ts
│   └── plugins
│       ├── controlsMenu        					=> 插件名
│       │   ├── command.js								=> 插件指令逻辑					
│       │   ├── constant.ts						  	=> 插件特有的字符串 统一放在此处声明
│       │   ├── editing.js							  => 插件逻辑、转换逻辑、schema注册等
│       │   ├── index.js									=> 暴露插件
│       │   ├── toolbar.js							  => 插件工具栏(忽略这个)
│       │   ├── ui.js									  	=> 插件UI
│       │   └── util.ts								  	=> 插件的工具函数
```

