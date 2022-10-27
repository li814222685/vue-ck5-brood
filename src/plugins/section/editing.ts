/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { SectionCommand } from "./command";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { V_SECTION } from "./constant";
import View from "@ckeditor/ckeditor5-engine/src/view/view";
import { Element, ViewDocument } from "@ckeditor/ckeditor5-engine";
import { Item } from "@ckeditor/ckeditor5-engine/src/view/item";
import RootElement from "@ckeditor/ckeditor5-engine/src/model/rootelement";

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
    this._defineSchema();
    this._defineConverters();

    // this.editor.commands.add(COMMAND_NAME__INSERT_SELECT, new SectionCommand(this.editor));
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

      // The inline widget can have the same attributes as text (for example linkHref, bold).
      allowAttributesOf: "$text",

      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ["modelName", "type", "cases", "data-cases"],
    });

    // schema.addChildCheck((context, childDefinition) => {
    //   if (context.endsWith(V_OPTIONS) && childDefinition.name == CONTROLS_CONTAINER) {
    //     return false;
    //   }
    // });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: V_SECTION,
      model: (viewEle, { writer }) => {
        const v_section = writer.createElement(V_SECTION, viewEle.getAttributes() as any);
        console.log("children:::", [...viewEle.getChildren()]);
        [...viewEle.getChildren()].forEach(childNode => {
          try {
            console.log(childNode);
            writer.insert(childNode as any, v_section, "end");
          } catch (error) {
            console.error(error);
          }
        });

        return v_section;
      },
    });

    conversion.for("downcast").elementToElement({
      model: V_SECTION,
      view: (modelEle, { writer }) => {
        const sectionAttrs = Object.fromEntries([...(modelEle.getAttributes() as Generator<[string, string], any, unknown>)]);
        const section = writer.createContainerElement("section", sectionAttrs);
        console.log("section", section);
        return toWidget(section, writer);
      },
    });
  }
}
