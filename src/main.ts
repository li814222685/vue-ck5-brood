import { createApp } from "vue";
import App from "./App.vue";
import CKEditor from "@ckeditor/ckeditor5-vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

createApp(App).use(CKEditor).use(ElementPlus).mount("#app");
