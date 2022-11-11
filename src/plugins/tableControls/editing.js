/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import {
  converDowncastCell,
  isRestrictedElement,
  isCellHasTableSelect,
  createSelect,
} from "./util";
import { ClickObserver } from "@ckeditor/ckeditor5-engine";
import {
  COMMAND_NAME__INSERT_TABLE_SELECT,
  COMMAND_NAME__INSERT_TABLE_NORMAL,
  V_SELECT_DROPDOWN_TEXT_SELE,
  HIDDEN_ITEM,
} from "./constant";
import { TableControlsCommand, TableSelectCommand } from "./command";
import { V_SELECT } from "./constant";
import { toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import { V_SELECT_DROPDOWN_TEXT } from "./constant";
import { emitter } from "../../components/mode/mitt";
import { SAVE_HIDDEN_ITEM } from "../../components/mode/mitt";
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
    schema.register("v-div-c", {
      allowWhere: "$text",
      isObject: true,
      isBlock: true,
      isLimit: true,
      allowAttributes: ["class", "id", "contenteditable", "data-cke-ignore-events"],
    });
    schema.register("v-div", {
      allowIn: ["v-div", "v-div-c"],
      isLimit: true,
      allowContentOf: "$root",
      allowAttributes: [
        "class",
        "id",
        "contenteditable",
        "data-value",
        "label",
        "data-cke-ignore-events",
      ],
    });
    schema.extend("tableCell", {
      allowAttributes: ["type", "colspan", "rowspan"],
    });
    schema.register("v-span", {
      allowWhere: "$block",
      isInline: true,
      isObject: true,
      allowAttributesOf: "$text",
      allowAttributes: ["class", "id", "contenteditable"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    //Cover :Table 单元格outputData 的逻辑重写
    conversion.for("dataDowncast").elementToElement({
      model: "tableCell",
      view: converDowncastCell(),
      converterPriority: "highest",
    });
    conversion.for("editingDowncast").elementToElement({
      model: {
        name: "v-div-c",
        classes: V_SELECT,
      },
      view: (modelEle, { writer }) => {
        const container = writer.createContainerElement("div", modelEle.getAttributes());
        return toWidget(container, writer, { hasSelectionHandle: false });
      },
      renderUnsafeAttributes: ["data-cke-ignore-events"],
    });
    conversion.for("editingDowncast").elementToElement({
      model: "v-div",
      view: (modelEle, { writer }) => {
        return toWidgetEditable(
          writer.createEditableElement("div", modelEle.getAttributes()),
          writer
        );
      },
      renderUnsafeAttributes: ["data-cke-ignore-events"],
    });
    conversion.for("editingDowncast").elementToElement({
      model: "v-span",
      view: (modelEle, { writer }) => {
        return writer.createAttributeElement("span", modelEle.getAttributes());
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
      const isRestrict = isRestrictedElement(target);
      const isHasTableSelect = isCellHasTableSelect(target);

      if (isRestrict && isHasTableSelect) {
        new Promise(res => {
          editingView.change(writer => {
            writer.addClass(HIDDEN_ITEM, target);
            res(target);
          });
        }).then(hidEle => {
          model.change(writer => {
            const tableSelectRange = model.insertObject(createSelect(writer), null, null, {
              setSelection: "on",
            });
            emitter.emit(SAVE_HIDDEN_ITEM, { element: hidEle, range: tableSelectRange });
          });
        });
      }

      // const modelEle = editor.editing.mapper.toModelElement(target);
    });
  }
}
