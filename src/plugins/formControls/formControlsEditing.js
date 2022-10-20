/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { InsertSimpleBoxCommand, createSimpleBox } from "./insertsimpleboxcommand";
import { toWidget, toWidgetEditable, viewToModelPositionOutsideModelElement } from "@ckeditor/ckeditor5-widget/src/utils";
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

    this.editor.commands.add("insertSimpleBox", new InsertSimpleBoxCommand(this.editor));

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass("restricted-editing-exception"))
    );

    // editingView.change((writer) => {
    //   const section = writer.createContainerElement("span", {
    //     class: "simple-box",
    //   });

    //   writer.insert(docFrag);
    // });
  }

  _defineSchema() {
    const schema = this.editor.model.schema;
    schema.register("span", {
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
    });

    schema.register("simpleBox", {
      isObject: true,
      isInline: true,
      allowWhere: "$text",
    });
    schema.register("control-select", {
      isObject: false,
      isInline: true,
      allowWhere: "$text",
      isContent: true,
      isSelectable: true,
    });
    schema.register("simpleSpan", {
      isObject: true,
      isInline: true,
      allowWhere: "$text",
    });
    schema.register("select", {
      isObject: true,
      isInline: true,
      allowWhere: "$block",
    });

    schema.register("simpleBoxTitle", {
      isLimit: true,
      isSelectable: true,
      isInline: true,
      allowIn: "simpleBox",
      allowContentOf: "$block",
    });

    schema.register("simpleBoxDescription", {
      // Cannot be split or left by the caret.
      isLimit: true,
      isSelectable: true,
      isInline: true,
      allowIn: "simpleBoxTitle",
      allowContentOf: "$root",
    });
    schema.register("simpleBoxDescriptions", {
      isLimit: true,
      isSelectable: true,
      allowIn: "simpleBoxTitle",
      allowContentOf: "$root",
    });

    schema.addChildCheck((context, childDefinition) => {
      if (context.endsWith("simpleBoxDescriptions") && childDefinition.name == "simpleBox") {
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

    conversion.for("downcast").elementToElement({
      model: "simpleBox",
      view: {
        name: "span",
        classes: "simple-box restricted-editing-exception extendBackground",
      },
    });
    // conversion.for("downcast").elementToElement({
    //   model: "simpleSpan",
    //   view: {
    //     name: "span",
    //     classes: "restricted-editing-exception ",
    //   },
    // });
    // <simpleBoxTitle> converters
    conversion.for("upcast").elementToElement({
      view: "control-select",
      model: (ele, { writer }) => {
        console.log(ele.getClassNames());
        return writer.createElement("control-select", { class: [...ele.getClassNames()].join(" ") });
      },
      converterPriority: "highest",
    });
    conversion.for("downcast").elementToElement({
      model: "control-select",
      view: (ele, { writer }) => {
        const span = writer.createContainerElement(
          "span",
          {
            class: ele.getAttribute("class"),
          },
          [writer.createText("我就是控件点我试试？")]
        );
        console.log(span);
        return toWidgetEditable(span, writer);
      },
      converterPriority: "highest",
    });

    conversion.for("downcast").markerToHighlight({
      model: "restrictedEditingException",
      // Use callback to return new object every time new marker instance is created - otherwise it will be seen as the same marker.
      view: (data, { writer }) => {
        console.log(data);
        return {
          name: "span",
          classes: "restricted-editing-exception",
        };
      },
      renderUnsafeAttributes: ["classes", "controlType"],
      converterPriority: "high",
    });

    conversion.for("upcast").elementToElement({
      // model: 'simpleBoxTitle',
      view: {
        name: "select",
        classes: "virtual-select",
      },
      model: (viewElement, conversionApi) => {
        const modelWriter = conversionApi.writer;

        return modelWriter.createElement("virtual-select", {
          level: viewElement.getAttribute("data-level"),
        });
      },
    });

    conversion.for("downcast").elementToElement({
      model: "simpleBoxTitle",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const select = viewWriter.createEditableElement(
          "select",
          {
            class: "virtual-select extendBackground ",
            "data-cke-ignore-events": true,
          },
          {
            renderUnsafeAttributes: ["onchange", "data-cke-ignore-events"],
          }
        );

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

    conversion.for("downcast").elementToElement({
      model: "simpleBoxDescription",
      view: (modelElement, { writer }) => {
        const option = writer.createEditableElement("option", {
          class: "simple-box-description",
          label: "Lee",
          value: "Lee",
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

    conversion.for("downcast").elementToElement({
      model: "simpleBoxDescriptions",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const option = viewWriter.createEditableElement("option", { class: "simple-box-descriptions", value: "李浩", label: "李浩" }, ["no"]);

        return toWidgetEditable(option, viewWriter);
      },
    });

    conversion.for("downcast").elementToElement({
      model: "simpleBoxTitle",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const select = viewWriter.createEditableElement("select", {
          class: "virtual-select",
        });
        return toWidgetEditable(select, viewWriter);
      },
    });
  }
}
