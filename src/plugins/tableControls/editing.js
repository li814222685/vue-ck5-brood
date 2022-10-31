/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { converDowncastCell, isRestrictedElement } from "./util";
import { ClickObserver } from "@ckeditor/ckeditor5-engine";
import { COMMAND_NAME__INSERT_TABLE_SELECT } from "./constant";
import { TableControlsCommand } from "./command";
export default class TableControlsEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this._listenToClick();
    this.editor.commands.add(
      COMMAND_NAME__INSERT_TABLE_SELECT,
      new TableControlsCommand(this.editor)
    );
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
      console.log(target);
      const isRestrict = isRestrictedElement(target);
      console.log(isRestrict);
      // const modelEle = editor.editing.mapper.toModelElement(target);
    });
  }
}
