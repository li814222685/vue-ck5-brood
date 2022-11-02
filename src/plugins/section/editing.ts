/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { SectionCommand } from "./command";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { COMMAND_NAME__INSERT_SECTION, V_SECTION, V_SPAN } from "./constant";
import FocusTracker from "@ckeditor/ckeditor5-utils/src/focustracker";

interface SectionAttrs {
  modelname: string;
  type: string;
  "data-cases": string;
}

export default class SectionEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this.editor.commands.add(COMMAND_NAME__INSERT_SECTION, new SectionCommand(this.editor));

    this._defineSchema();
    this._defineConverters();
  }

  _defineSchema() {
    const schema = this.editor.model.schema;
    schema.register(V_SECTION, {
      // Allow wherever text is allowed:
      allowWhere: "$text",

      // The placeholder will act as an inline node:
      isInline: true,

      // The inline widget is self-contained so it cannot be split by the caret and it can be selected:
      isObject: true,

      isBlock: true,

      allowChildren: ["$block", "$text"],

      // The inline widget can have the same attributes as text (for example linkHref, bold).
      allowAttributesOf: "$text",

      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ["modelName", "type", "cases", "data-cases", "data-cke-ignore-events"],
    });
    schema.register("v-span", {
      allowWhere: "$block",
      isInline: true,
      isObject: true,
      allowAttributesOf: "$text",
      allowAttributes: ["class", "data-cke-ignore-events"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: V_SECTION,
      model: (viewEle, { writer }) => writer.createElement(V_SECTION, viewEle.getAttributes() as any),
    });

    conversion.for("downcast").elementToElement({
      model: V_SECTION,
      view: (modelEle, { writer }) => {
        const sectionAttrs = Object.fromEntries([...(modelEle.getAttributes() as Generator<[string, string], any, unknown>)]);
        const section = writer.createEditableElement("section", sectionAttrs);
        return toWidgetEditable(section, writer);
      },
    });
    // conversion.for("editingDowncast").elementToElement({
    conversion.for("downcast").elementToElement({
      model: V_SPAN,
      view: (modelEle, { writer }) => {
        const attributesList = Object.fromEntries([...(modelEle.getAttributes() as Generator<[string, string], any, unknown>)]);
        const span = writer.createEditableElement("span", attributesList, {
          renderUnsafeAttributes: ["data-cke-ignore-events"],
        });
        return toWidgetEditable(span, writer);
      },
    });
  }
}
