/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import { CONTROLS_CONTAINER, V_OPTION, V_OPTIONS, V_SELECT } from "./constant";

export class InsertControlsCommand extends Command {
  execute() {
    return this.editor.model.change(writer => {
      return this.editor.model.insertObject(createSimpleBox(writer));
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), CONTROLS_CONTAINER);

    this.isEnabled = allowedIn !== null;
  }
}
export function createSimpleBox(writer) {
  const controls = writer.createElement(CONTROLS_CONTAINER); // => span
  const v_select = writer.createElement(V_SELECT); // => select
  const v_option = writer.createElement(V_OPTION); // => option
  const v_options = writer.createElement(V_OPTIONS); // => option

  writer.append(v_select, controls);
  writer.append(v_option, v_select);
  writer.append(v_options, v_select);

  return controls;
}

export default {
  InsertControlsCommand,
};
