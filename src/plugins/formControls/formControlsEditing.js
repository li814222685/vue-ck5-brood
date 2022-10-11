/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {
  InsertSimpleBoxCommand,
  createSimpleBox,
} from "./insertsimpleboxcommand";
import {
  toWidget,
  toWidgetEditable,
} from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { getMarkerAtPosition } from "../other/restrictededitingmode/utils";
export default class FormControlEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    const editingView = this.editor.editing.view;
    const position = editingView.createPositionAfter;
    // const position = selection.getFirstRange();
    this._defineSchema();
    this._defineConverters();
    this._markerToSelect();

    this.editor.commands.add(
      "insertSimpleBox",
      new InsertSimpleBoxCommand(this.editor)
    );

    // editingView.change((writer) => {
    //   const section = writer.createContainerElement("span", {
    //     class: "simple-box",
    //   });

    //   writer.insert(docFrag);
    // });
  }

  _markerToSelect() {
    const view = this.editor.editing.view;
    const model = this.editor.model;
    const markers = new Set();

    const modelSelection = model.document.selection;
    const marker = getMarkerAtPosition(this.editor, modelSelection.anchor);
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("simpleBox", {
      isObject: true,
      isInline: true,
      allowWhere: "$block",
    });
    schema.register("select", {
      isObject: true,
      isInline: true,
      allowWhere: "$block",
    });

    schema.register("simpleBoxTitle", {
      isLimit: true,
      isInline: true,
      allowIn: "simpleBox",
      allowContentOf: "$block",
    });

    schema.register("simpleBoxDescription", {
      // Cannot be split or left by the caret.
      isLimit: true,
      isInline: true,
      allowIn: "simpleBoxTitle",
      allowContentOf: "$root",
    });
    schema.register("simpleBoxDescriptions", {
      isLimit: true,
      allowIn: "simpleBoxTitle",
      allowContentOf: "$root",
    });
    schema.addChildCheck((context, childDefinition) => {
      if (
        context.endsWith("simpleBoxDescriptions") &&
        childDefinition.name == "simpleBox"
      ) {
        return false;
      }
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    // <simpleBox> converters
    conversion.for("upcast").elementToElement({
      model: "simpleBox",
      view: {
        name: "span",
        classes: "simple-box",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "simpleBox",
      view: {
        name: "span",
        classes: "simple-box",
      },
    });
    conversion.for("downcast").elementToElement({
      model: "simpleBox",
      view: {
        name: "span",
        classes: "simple-box",
      },
    });
    conversion.for("downcast").elementToElement({
      model: "simpleBox",
      view: (modelElement, { writer: viewWriter }) => {
        const section = viewWriter.createContainerElement("span", {
          class: "simple-box",
        });

        return toWidget(section, viewWriter, { abbr: "simple box widget" });
      },
    });

    // <simpleBoxTitle> converters

    conversion.for("upcast").elementToElement({
      // model: 'simpleBoxTitle',
      view: {
        name: "select",
        classes: "simple-box-title",
      },
      model: (viewElement, conversionApi) => {
        const modelWriter = conversionApi.writer;

        return modelWriter.createElement("simple-box-title", {
          level: viewElement.getAttribute("data-level"),
        });
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "simpleBoxTitle",
      view: {
        name: "select",
        classes: "simple-box-title",
      },
    });
    conversion.for("downcast").elementToElement({
      model: "simpleBoxTitle",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const select = viewWriter.createEditableElement("select", {
          class: "simple-box-title",
        });
        return toWidgetEditable(select, viewWriter);
      },
    });

    // <simpleBoxDescription> converters
    conversion.for("upcast").elementToElement({
      model: "simpleBoxDescription",
      view: {
        name: "option",
        classes: "simple-box-description",
        value: "666",
        label: "666",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "simpleBoxDescription",
      view: {
        name: "option",
        classes: "simple-box-description",
        label: "999",
        value: "999",
      },
    });
    conversion.for("downcast").elementToElement({
      model: "simpleBoxDescription",
      view: (modelElement, { writer }) => {
        const option = writer.createEditableElement("option", {
          class: "simple-box-description",
          label: "否",
          value: false,
        });

        return toWidgetEditable(option, writer);
      },
    });

    conversion.for("upcast").elementToElement({
      model: "simpleBoxDescriptions",
      view: {
        name: "option",
        classes: "simple-box-descriptions",
        label: "666",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "simpleBoxDescriptions",
      view: {
        name: "option",
        classes: "simple-box-descriptions",
        label: "666",
      },
    });
    conversion.for("downcast").elementToElement({
      model: "simpleBoxDescriptions",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const option = viewWriter.createEditableElement(
          "option",
          { class: "simple-box-descriptions", value: true, label: "是" },
          ["no"]
        );

        return toWidgetEditable(option, viewWriter);
      },
    });

    conversion.for("downcast").elementToElement({
      model: "simpleBoxTitle",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const select = viewWriter.createEditableElement("select", {
          class: "simple-box-title",
        });
        return toWidgetEditable(select, viewWriter);
      },
    });
  }
}
