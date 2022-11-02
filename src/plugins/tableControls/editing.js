/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { converDowncastCell, isRestrictedElement } from "./util";
import { ClickObserver } from "@ckeditor/ckeditor5-engine";
import { COMMAND_NAME__INSERT_TABLE_SELECT, COMMAND_NAME__INSERT_TABLE_NORMAL } from "./constant";
import { TableControlsCommand, TableSelectCommand } from "./command";
export default class TableControlsEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this._listenToClick();
    this.editor.commands.add(
      COMMAND_NAME__INSERT_TABLE_NORMAL,
      new TableControlsCommand(this.editor)
    );
    this.editor.commands.add(
      COMMAND_NAME__INSERT_TABLE_SELECT,
      new TableSelectCommand(this.editor)
    );
  }

  _defineSchema() {
    const schema = this.editor.model.schema;
    schema.register("v-div", {
      // Allow wherever text is allowed:
      allowWhere: "$block",

      // The placeholder will act as an inline node:
      isBlock: true,

      // The inline widget is self-contained so it cannot be split by the caret and it can be selected:
      isObject: true,

      // The inline widget can have the same attributes as text (for example linkHref, bold).
      allowAttributesOf: "$text",

      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ["class"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    //Table 单元格outputData 的逻辑重写
    conversion.for("dataDowncast").elementToElement({
      model: "tableCell",
      view: converDowncastCell(),
      converterPriority: "highest",
    });
    conversion.for("editingDowncast").elementToElement({
      model: "v-div",
      view: (modelEle, { writer }) => {
        return writer.createContainerElement("div", { class: modelEle.getAttribute("class") });
      },
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
