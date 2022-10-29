/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { InsertControlsCommand, InsertOptionsCommand } from "./command";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import {
  COMMAND_NAME__INSERT_SELECT,
  CONTROLS_CONTAINER,
  CUSTOM_PROPERTY__SELECT,
  V_OPTIONS,
  V_SELECT,
  COMMAND_NAME__INSERT_OPTIONS,
} from "./constant";
import { V_OPTION } from "./constant";
import { converDowncastCell } from "./util";
import { ClickObserver } from "@ckeditor/ckeditor5-engine";
export default class TableControlsEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this._listenToClick();
  }

  _defineSchema() {
    const schema = this.editor.model.schema;
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    //Table 单元格outputData 的逻辑重写
    conversion.for("dataDowncast").elementToElement({
      model: "tableCell",
      view: converDowncastCell(),
      converterPriority: "highest",
    });
  }
  _listenToClick() {
    const editor = this.editor;
    const model = editor.model;
    const editingView = editor.editing.view;
    const viewDocument = editor.editing.view.document;

    editingView.addObserver(ClickObserver);
    this.listenTo(viewDocument, "click", (event, data) => {
      const target = data.target;
      const modelEle = editor.editing.mapper.toModelElement(target);
      console.log(modelEle);
    });
  }
}
