/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/blockquoteediting
 */

import { Plugin } from "ckeditor5/src/core";
import { Enter } from "ckeditor5/src/enter";
import { Delete } from "ckeditor5/src/typing";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import BlockQuoteCommand from "./blockquotecommand";

/**
 * The block quote editing.
 *
 * Introduces the `'section'` command and the `'section'` model element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BlockQuoteEditing extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "BlockQuoteEditing";
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [Enter, Delete];
  }

  /**
   * @inheritDoc
   */
  init() {
    this._defineSchema();
    this._defineConverters();
  }

  _defineSchema() {
    const schema = this.editor.model.schema;
    schema.register("section", {
      // Allow wherever text is allowed:
      allowWhere: "$text",

      // The placeholder will act as an inline node:
      isInline: true,

      // The inline widget is self-contained so it cannot be split by the caret and it can be selected:
      isObject: true,

      // The inline widget can have the same attributes as text (for example linkHref, bold).
      allowAttributesOf: "$text",

      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ["class", "controlType"],
      inheritAllFrom: "$container",
    });
  }

  _defineConverters() {
    const editor = this.editor;
    editor.commands.add("section", new BlockQuoteCommand(editor));
    // <simpleBox> converters
    editor.conversion.for("upcast").elementToElement({
      model: "section",
      view: {
        name: "section",
        classes: "section",
      },
    });
    editor.conversion.for("dataDowncast").elementToElement({
      model: "v-section",
      view: {
        name: "section",
        classes: "section",
      },
    });
    editor.conversion.for("editingDowncast").elementToElement({
      model: "section",
      view: (modelElement, { writer: viewWriter }) => {
        const section = viewWriter.createEditableElement(
          "section",
          {
            class: "section",
            cases: "",
            modelName: "",
            type: "",
          },
          {
            renderUnsafeAttributes: ["onchange", "data-cke-ignore-events", "cases", "modelName", "type"],
          }
        );
        return toWidgetEditable(section, viewWriter, { label: "simple cc box widget" });
      },
    });
  }
}
