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
    const editor = this.editor;
    const schema = editor.model.schema;

    editor.commands.add("section", new BlockQuoteCommand(editor));

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

    // <simpleBox> converters
    editor.conversion.for("upcast").elementToElement({
      model: "section",
      view: {
        name: "section",
        classes: "section",
      },
    });
    editor.conversion.for("dataDowncast").elementToElement({
      model: "section",
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
          { class: "section" },
          {
            renderUnsafeAttributes: ["onchange", "data-cke-ignore-events"],
          }
        );

        return toWidgetEditable(section, viewWriter, { label: "simple cc box widget" });
      },
    });

    // editor.conversion.elementToElement( { model: 'section', view: {
    //   name: 'section',
    //   classes: 'section'
    // } } );

    // Postfixer which cleans incorrect model states connected with block quotes.
    editor.model.document.registerPostFixer(writer => {
      const changes = editor.model.document.differ.getChanges();
      for (const entry of changes) {
        if (entry.type == "insert") {
          const element = entry.position.nodeAfter;

          if (!element) {
            // We are inside a text node.
            continue;
          }

          if (element.is("element", "section") && element.isEmpty) {
            // Added an empty section - remove it.
            writer.remove(element);

            return true;
          } else if (element.is("element", "section") && !schema.checkChild(entry.position, element)) {
            // Added a section in incorrect place. Unwrap it so the content inside is not lost.
            writer.unwrap(element);

            return true;
          } else if (element.is("element")) {
            // Just added an element. Check that all children meet the scheme rules.
            const range = writer.createRangeIn(element);

            for (const child of range.getItems()) {
              if (child.is("element", "section") && !schema.checkChild(writer.createPositionBefore(child), child)) {
                writer.unwrap(child);

                return true;
              }
            }
          }
        } else if (entry.type == "remove") {
          const parent = entry.position.parent;

          if (parent.is("element", "section") && parent.isEmpty) {
            // Something got removed and now section is empty. Remove the section as well.
            writer.remove(parent);

            return true;
          }
        }
      }

      return false;
    });

    const viewDocument = this.editor.editing.view.document;
    const selection = editor.model.document.selection;
    const blockQuoteCommand = editor.commands.get("section");

    // Overwrite default Enter key behavior.
    // If Enter key is pressed with selection collapsed in empty block inside a quote, break the quote.
    this.listenTo(
      viewDocument,
      "enter",
      (evt, data) => {
        if (!selection.isCollapsed || !blockQuoteCommand.value) {
          return;
        }

        const positionParent = selection.getLastPosition().parent;

        if (positionParent.isEmpty) {
          editor.execute("section");
          editor.editing.view.scrollToTheSelection();

          data.preventDefault();
          evt.stop();
        }
      },
      { context: "blockquote" }
    );

    // Overwrite default Backspace key behavior.
    // If Backspace key is pressed with selection collapsed in first empty block inside a quote, break the quote.
    this.listenTo(
      viewDocument,
      "delete",
      (evt, data) => {
        if (data.direction != "backward" || !selection.isCollapsed || !blockQuoteCommand.value) {
          return;
        }

        const positionParent = selection.getLastPosition().parent;

        if (positionParent.isEmpty && !positionParent.previousSibling) {
          editor.execute("section");
          editor.editing.view.scrollToTheSelection();

          data.preventDefault();
          evt.stop();
        }
      },
      { context: "blockquote" }
    );
  }
}
