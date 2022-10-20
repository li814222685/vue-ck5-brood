/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";

export class InsertControlsCommand extends Command {
  execute() {
    return this.editor.model.change(writer => {
      return this.editor.model.insertObject(createSimpleBox(writer));
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "controls");

    this.isEnabled = allowedIn !== null;
  }
}
export function createSimpleBox(writer) {
  const controls = writer.createElement("controls"); // => span
  const v_select = writer.createElement("v-select"); // => select
  const v_option = writer.createElement("v-option"); // => option
  const v_options = writer.createElement("v-options"); // => option

  writer.append(v_select, controls);
  writer.append(v_option, v_select);
  writer.append(v_options, v_select);

  return controls;
}

export default {
  InsertControlsCommand,
};
