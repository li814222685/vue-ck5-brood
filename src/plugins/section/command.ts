/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import { Model } from "@ckeditor/ckeditor5-engine";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import _ from "lodash";

interface Option {
  label: string | number;
  value: string | number | boolean;
}

export class SectionCommand extends Command {
  execute() {}

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    // const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), CONTROLS_CONTAINER);

    // this.isEnabled = allowedIn !== null;
  }
}

export default {
  SectionCommand,
};
