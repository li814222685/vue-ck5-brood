# vue-ck5-brood



## åªæ¯ä¸ä¸ªð£DEMO

### FrameWorkï¼Vue3 + Ts + CKEditor5

> ç®åé¡¹ç®å·²ç»å¼å¥äºCK5 å®æ¹ é¨åæ ¸å¿ï¼"@types/ckeditor__ckeditor5-engine"ï¼çTypesåï¼å·²ç»å¯ä»¥ç´æ¥å¼å¥ä½¿ç¨äºï¼

```typescript
// src/plugins/controlsMenu/util
import { Element } from "@ckeditor/ckeditor5-engine";
import Selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import { CUSTOM_PROPERTY__SELECT } from "./constant";

/** è·åéä¸­çæ§ä»¶ */
export function getSelectedWidget(selection: Selection) {
  const viewElement = selection.getSelectedElement();
  console.log(viewElement);
  if (viewElement && isControls(viewElement)) {
    return viewElement;
  }
  return null;
}
/** è§å¾åç´ æ¯å¦ä¸ºèªå®ä¹æ§ä»¶ */
const isControls = (viewElement: Element): boolean => {
  return viewElement.getAttribute(CUSTOM_PROPERTY__SELECT) as boolean;
};

```



### CK5 æä»¶å¼åç»æè§èï¼å¯ç´æ¥å¤å¶åè¿è¡æ¹é ï¼ï¼

```js
ââ src
â   âââ App.vue
â   âââ components
â   âââ main.ts
â   âââ plugins
â       âââ controlsMenu        					=> æä»¶å
â       â   âââ command.js								=> æä»¶æä»¤é»è¾					
â       â   âââ constant.ts						  	=> æä»¶ç¹æçå­ç¬¦ä¸² ç»ä¸æ¾å¨æ­¤å¤å£°æ
â       â   âââ editing.js							  => æä»¶é»è¾ãè½¬æ¢é»è¾ãschemaæ³¨åç­
â       â   âââ index.js									=> æ´é²æä»¶
â       â   âââ toolbar.js							  => æä»¶å·¥å·æ (å¿½ç¥è¿ä¸ª)
â       â   âââ ui.js									  	=> æä»¶UI
â       â   âââ util.ts								  	=> æä»¶çå·¥å·å½æ°
```

