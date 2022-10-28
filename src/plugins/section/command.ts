/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import { Model } from "@ckeditor/ckeditor5-engine";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import _ from "lodash";
import { V_SECTION } from "./constant";

interface Option {
  label: string | number;
  value: string | number | boolean;
}

export class SectionCommand extends Command {
  execute() {
    console.log(
      "%c🍉Lee%cline:17%c我来自SectionCommand",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(20, 68, 106);padding:3px;border-radius:2px",
      "我来自SectionCommand!!!!"
    );
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), V_SECTION);

    this.isEnabled = allowedIn !== null;
  }
}

export default {
  SectionCommand,
};
