/**
 * @description Plugin Entry
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ControlsMenuUI from "./controlsMenuUi";
import ControlsMenuEditing from "./controlsMenuEditing";

export default class controlsMenu extends Plugin {
  static get requires() {
    return [ControlsMenuEditing, ControlsMenuUI];
  }
}
