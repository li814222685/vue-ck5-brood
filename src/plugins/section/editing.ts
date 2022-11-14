/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { SectionCommand, InsertSectionCommand } from "./command";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { COMMAND_NAME__INSERT_SECTION, V_SECTION, COMMAND__INSERT_SECTION, V_SPAN } from "./constant";
import FocusTracker from "@ckeditor/ckeditor5-utils/src/focustracker";

interface SectionAttrs {
  modelname: string;
  type: string;
  currentcase: string;
  "data-cases": [];
  id: string;
}

export default class SectionEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this.editor.commands.add(COMMAND_NAME__INSERT_SECTION, new SectionCommand(this.editor));
    this.editor.commands.add(COMMAND__INSERT_SECTION, new InsertSectionCommand(this.editor));

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
      allowAttributes: ["modelname", "type", "currentcase", "data-cases", "data-cke-ignore-events", "class", "id"],
      inheritAllFrom: "$container",
    });
    schema.register("p", {
      // Cannot be split or left by the caret.
      isLimit: true,
      isSelectable: true,
      isInline: true,
      allowContentOf: "$root",
      allowAttributes: ["label", "value"],
    });
    // schema.register(V_SPAN, {
    //   allowWhere: "$block",
    //   isInline: true,
    //   isObject: true,
    //   allowAttributesOf: "$text",
    //   allowAttributes: ["class", "data-cke-ignore-events"],
    // });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: V_SECTION,
      model: (viewEle, { writer }) => writer.createElement(V_SECTION, viewEle.getAttributes() as any),
    });

    conversion.for("editingDowncast").elementToElement({
      model: V_SECTION,
      view: (modelEle, { writer }) => {
        const sectionAttrs = Object.fromEntries([...(modelEle.getAttributes() as Generator<[string, string], any, unknown>)]);
        sectionAttrs.class = "section";
        const section = writer.createEditableElement("section", sectionAttrs, {
          renderUnsafeAttributes: ["onchange", "data-cke-ignore-events", "data-cases", "currentcase", "modelname", "type", "id"],
        });
        return toWidgetEditable(section, writer);
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: V_SECTION,
      view:(modelEle,{writer}) => writer.createContainerElement(V_SECTION,modelEle.getAttributes(),{
        renderUnsafeAttributes: [ "data-cases", "currentcase", "modelname", "type", "id"],
      })
    });
    conversion.for("downcast").elementToElement({
      model: V_SPAN,
      view: (modelEle, { writer }) => {
        let attributesList = Object.fromEntries([...(modelEle.getAttributes() as Generator<[string, string], any, unknown>)]);
        // "data-cke-ignore-events" 会导致失焦，无法选中元素
        const span = writer.createEditableElement("span", attributesList, {
          renderUnsafeAttributes: ["data-cke-ignore-events"],
        });
        return toWidgetEditable(span, writer);
      },
    });
  }
}
