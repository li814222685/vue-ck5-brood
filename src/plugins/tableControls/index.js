/**
 * @description Plugin Entry
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import TableControlsUI from "./ui";
import TableControlsEditing from "./editing";

export default class TableControls extends Plugin {
  static get requires() {
    return [TableControlsEditing, TableControlsUI];
  }
}
