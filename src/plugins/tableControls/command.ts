/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import { Model } from "@ckeditor/ckeditor5-engine";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { CONTROLS_CONTAINER, V_OPTION, V_OPTIONS, V_SELECT } from "./constant";
import _ from "lodash";

interface Option {
  label: string | number;
  value: string | number | boolean;
}

export class TableControlsCommand extends Command {
  execute() {}

  refresh() {}
}

export default {
  TableControlsCommand,
};
