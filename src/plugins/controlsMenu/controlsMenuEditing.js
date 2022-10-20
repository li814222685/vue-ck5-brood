/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { InsertControlsCommand, createSimpleBox } from "./insertControlsCommand";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { getMarkerAtPosition } from "../other/restrictededitingmode/utils";
export default class ControlsMenuEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add("insertSelect", new InsertControlsCommand(this.editor));
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

    schema.register("controls", {
      isObject: true,
      isInline: true,
      allowWhere: "$text",
    });

    schema.register("v-select", {
      isLimit: true,
      isSelectable: true,
      isInline: true,
      allowIn: "controls",
      allowContentOf: "$block",
    });

    schema.register("v-option", {
      // Cannot be split or left by the caret.
      isLimit: true,
      isSelectable: true,
      isInline: true,
      allowIn: "v-select",
      allowContentOf: "$root",
    });
    schema.register("v-options", {
      isLimit: true,
      isSelectable: true,
      allowIn: "v-select",
      allowContentOf: "$root",
    });
    schema.addChildCheck((context, childDefinition) => {
      if (context.endsWith("v-options") && childDefinition.name == "controls") {
        return false;
      }
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    // <controls> converters
    conversion.for("upcast").elementToElement({
      model: "controls",
      view: {
        name: "span",
        classes: "simple-box",
      },
    });

    conversion.for("downcast").elementToElement({
      model: "controls",
      view: {
        name: "span",
        classes: "simple-box restricted-editing-exception extendBackground",
      },
    });

    conversion.for("downcast").markerToHighlight({
      model: "restrictedEditingException",
      // Use callback to return new object every time new marker instance is created - otherwise it will be seen as the same marker.
      view: (data, { writer }) => {
        console.log(data);
        return {
          name: "span",
          classes: "restricted-editing-exception lee",
          attributes: {
            controlType: "select",
          },
        };
      },
      renderUnsafeAttributes: ["classes", "controlType"],
      converterPriority: "high",
    });

    conversion.for("upcast").elementToElement({
      // model: 'v-select',
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
      model: "v-select",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const select = viewWriter.createEditableElement(
          "select",
          {
            class: "virtual-select extendBackground ",
            "data-cke-ignore-events": true,
            controlType: "select",
          },
          {
            renderUnsafeAttributes: ["onchange", "data-cke-ignore-events", "controlType"],
          }
        );

        return toWidgetEditable(select, viewWriter);
      },
    });
    // <v-option> converters
    conversion.for("upcast").elementToElement({
      model: "v-option",
      view: {
        name: "option",
        classes: "simple-box-description",
        value: "666",
        label: "666",
      },
    });

    conversion.for("downcast").elementToElement({
      model: "v-option",
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
      model: "v-options",
      view: {
        name: "option",
        classes: "simple-box-descriptions",
        label: "666",
      },
    });

    conversion.for("downcast").elementToElement({
      model: "v-options",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const option = viewWriter.createEditableElement("option", { class: "simple-box-descriptions", value: "李浩", label: "李浩" }, ["no"]);

        return toWidgetEditable(option, viewWriter);
      },
    });

    conversion.for("downcast").elementToElement({
      model: "v-select",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const select = viewWriter.createEditableElement("select", {
          class: "virtual-select",
        });
        return toWidgetEditable(select, viewWriter);
      },
    });
    /** dataDowncast */
    conversion.for("dataDowncast").elementToElement({
      model: "controls",
      view: "span",
      converterPriority: "high",
    });
    conversion.for("dataDowncast").elementToElement({
      model: {
        name: "v-select",
        attributes: ["controlType"],
      },
      view: (modelElement, { writer }) => {
        return writer.createEditableElement(
          "control-select",
          {
            class: "restricted-editing-exception control-select",
            controlType: "select",
          },
          {
            renderUnsafeAttributes: ["controlType"],
          }
        );
      },
      converterPriority: "high",
    });
    conversion.for("dataDowncast").elementToElement({
      model: "v-option",
      view: (modelElement, { writer }) => {
        return writer.createText("Lee");
      },
      converterPriority: "high",
    });
    conversion.for("dataDowncast").elementToElement({
      model: "v-options",
      view: (modelElement, { writer }) => {
        return writer.createText("");
      },
      converterPriority: "high",
    });
  }
}
