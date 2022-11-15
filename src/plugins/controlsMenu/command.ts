/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import { Model } from "@ckeditor/ckeditor5-engine";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { CONTROLS_CONTAINER, V_OPTION, V_OPTIONS, V_SELECT } from "./constant";
import _ from "lodash";
import { safeJsonStringify } from "../../components/utils";

interface Option {
  label: string | number;
  value: string | number | boolean;
}

export class InsertControlsCommand extends Command {
  execute() {
    return this.editor.model.change((writer: Writer) => {
      return (this.editor.model as any).insertObject(createSimpleBox(writer));
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), CONTROLS_CONTAINER);

    this.isEnabled = allowedIn !== null;
  }
}

export class InsertOptionsCommand extends Command {
  execute(options) {
    const model = this.editor.model;

    const select = model.document.selection.getSelectedElement();
    model.change(writer => {
      writer.remove(select);
      insertSelect(model, options);
    });
  }
}

export const insertSelect = (model, options: Option[]) => {
  if (!options || _.isEmpty(options)) {
    return;
  }

  console.log(
    "%c🍉Lee%cline:48%c888888",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(60, 79, 57);padding:3px;border-radius:2px",
    options
  );
  try {
    model.change(writer => {
      console.log(writer);
      const selectElement = createSimpleBox(writer, options);

      model.insertObject(selectElement, model.document.selection);
    });
  } catch (error) {
    console.error(error);
  }
};

export function createSimpleBox(writer: Writer, attrs?: Option[]) {
  //指令传入第二个参数时，动态创建 select - option
  if (attrs?.length > 0) {
    const controls = writer.createElement(CONTROLS_CONTAINER); // => span
    const v_select = writer.createElement(V_SELECT); // => select
    writer.setAttribute("optionList", safeJsonStringify(attrs), v_select);

    (attrs || []).forEach(opt => {
      const v_option = writer.createElement(V_OPTION, opt as any); // => option
      console.log(v_option);
      writer.append(v_option, v_select);
    });
    writer.append(v_select, controls);
    return controls;
  }

  const controls = writer.createElement(CONTROLS_CONTAINER); // => span
  const v_select = writer.createElement(V_SELECT); // => select

  writer.append(v_select, controls);

  return controls;
}

export default {
  InsertControlsCommand,
};
