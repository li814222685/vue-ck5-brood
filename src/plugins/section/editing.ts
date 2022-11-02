/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { SectionCommand,InsertSectionCommand } from "./command";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { COMMAND_NAME__INSERT_SECTION, V_SECTION,COMMAND__INSERT_SECTION,V_SPAN } from "./constant";
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
      allowAttributes: ["modelname", "type", "cases", "data-cases", "data-cke-ignore-events", "class"],
      inheritAllFrom: "$container",

    });
    schema.register("p", {
      // Cannot be split or left by the caret.
      isLimit: true,
      isSelectable: true,
      isInline: true,
      allowIn: V_SECTION,
      allowContentOf: "$root",
      allowAttributes: ["label", "value"],
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
        const section = writer.createEditableElement(
          "section",
          {
            class: "section",
            "data-cases": sectionAttrs["data-cases"],
            modelname: sectionAttrs.modelname,
            type: sectionAttrs.type,
          },
          {
            renderUnsafeAttributes: ["onchange", "data-cke-ignore-events", "data-cases", "modelname", "type"],
          }
        );
        return toWidgetEditable(section, writer);
      },
    });
    // conversion.for("upcast").elementToElement({
    //   view: "section",
    //   model: (viewEle, { writer }) => writer.createElement("section", viewEle.getAttributes() as any),
    // });
    conversion.for("upcast").elementToElement({
      model: "p",
      view: {
        name: "p",
        classes: "p",
      },
    });
    conversion.for("downcast").elementToElement({
      model: "p",
      view: (modelElement, { writer }) => {
        console.log(modelElement);
        console.log(modelElement.getAttribute("label"), modelElement.getAttribute("value"));
        const option = writer.createEditableElement("p", {
          class: "p",
          label: modelElement.getAttribute("label"),
          value: modelElement.getAttribute("value"),
        },{
          renderUnsafeAttributes: ["onchange", "data-cke-ignore-events", "data-cases", "modelname", "type","label", "value"]
        }
        );
        return toWidgetEditable(option, writer);
      },
      
    });
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
