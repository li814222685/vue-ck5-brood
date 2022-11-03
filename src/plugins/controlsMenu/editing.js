/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { InsertControlsCommand, InsertOptionsCommand } from "./command";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { COMMAND_NAME__INSERT_SELECT, CONTROLS_CONTAINER, CUSTOM_PROPERTY__SELECT, V_OPTIONS, V_SELECT, COMMAND_NAME__INSERT_OPTIONS } from "./constant";
import { V_OPTION } from "./constant";
import { converDowncastCell } from "./util";
export default class ControlsMenuEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add(COMMAND_NAME__INSERT_SELECT, new InsertControlsCommand(this.editor));
    this.editor.commands.add(COMMAND_NAME__INSERT_OPTIONS, new InsertOptionsCommand(this.editor));
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

    schema.register(CONTROLS_CONTAINER, {
      isObject: true,
      isInline: true,
      allowWhere: "$text",
    });

    schema.register(V_SELECT, {
      isLimit: true,
      isSelectable: true,
      isInline: true,
      allowIn: CONTROLS_CONTAINER,
      allowContentOf: "$block",
      allowAttributes: ["class", "options"],
    });

    schema.register(V_OPTION, {
      // Cannot be split or left by the caret.
      isLimit: true,
      isSelectable: true,
      isInline: true,
      allowIn: V_SELECT,
      allowContentOf: "$root",
      allowAttributes: ["label", "value"],
    });
    schema.register(V_OPTIONS, {
      isLimit: true,
      isSelectable: true,
      allowIn: V_SELECT,
      allowContentOf: "$root",
    });
    schema.addChildCheck((context, childDefinition) => {
      if (context.endsWith(V_OPTIONS) && childDefinition.name == CONTROLS_CONTAINER) {
        return false;
      }
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    // <controls> converters
    conversion.for("upcast").elementToElement({
      model: CONTROLS_CONTAINER,
      view: {
        name: "span",
        classes: CUSTOM_PROPERTY__SELECT,
      },
      attributes: {
        [CUSTOM_PROPERTY__SELECT]: true,
      },
    });

    conversion.for("downcast").elementToElement({
      model: CONTROLS_CONTAINER,
      view: {
        name: "span",
        classes: "restricted-editing-exception",
        attributes: {
          [CUSTOM_PROPERTY__SELECT]: true,
        },
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
      model: V_SELECT,
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

        return toWidget(select, viewWriter);
      },
    });
    // <v-option> converters
    conversion.for("upcast").elementToElement({
      model: V_OPTION,
      view: {
        name: "option",
        classes: "simple-box-description",
        value: "666",
        label: "666",
      },
    });

    conversion.for("downcast").elementToElement({
      model: V_OPTION,
      view: (modelElement, { writer }) => {
        console.log(modelElement);
        console.log(modelElement.getAttribute("label"), modelElement.getAttribute("value"));
        const option = writer.createEditableElement("option", {
          class: "simple-box-description",
          label: modelElement.getAttribute("label"),
          value: modelElement.getAttribute("value"),
        });

        return toWidget(option, writer);
      },
      renderUnsafeAttributes: ["label", "value"],
    });

    conversion.for("upcast").elementToElement({
      model: V_OPTIONS,
      view: {
        name: "option",
        classes: "simple-box-descriptions",
        label: "666",
      },
    });

    conversion.for("downcast").elementToElement({
      model: V_OPTIONS,
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const option = viewWriter.createEditableElement("option", { class: "simple-box-descriptions", value: "李浩", label: "李浩" }, ["no"]);

        return toWidget(option, viewWriter);
      },
    });

    conversion.for("downcast").elementToElement({
      model: V_SELECT,
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const select = viewWriter.createEditableElement("select", {
          class: "virtual-select",
          options: modelElement.getAttribute("options"),
        });
        return toWidget(select, viewWriter);
      },
    });
    /** dataDowncast */
    conversion.for("dataDowncast").elementToElement({
      model: CONTROLS_CONTAINER,
      view: "span",
      converterPriority: "high",
    });
    conversion.for("dataDowncast").elementToElement({
      model: {
        name: V_SELECT,
        attributes: ["controlType"],
      },
      view: (modelElement, { writer }) => {
        return writer.createEditableElement(
          // "control-select",
          "span",
          {
            class: "restricted-editing-exception control-select",
            controlType: "select",
            options: modelElement.getAttribute("options"),
          },
          {
            renderUnsafeAttributes: ["controlType"],
          }
        );
      },
      converterPriority: "high",
    });
    conversion.for("dataDowncast").elementToElement({
      model: V_OPTION,
      view: (modelElement, { writer }) => {
        console.log(modelElement);
        return writer.createText(modelElement.getAttribute("value"));
      },
      converterPriority: "high",
    });
    conversion.for("dataDowncast").elementToElement({
      model: V_OPTIONS,
      view: (modelElement, { writer }) => {
        return writer.createText("");
      },
      converterPriority: "high",
    });
  }
}
