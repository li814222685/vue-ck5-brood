/**
 * @description Plugin Entry
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ControlsMenuUI from "./ui";
import ControlsMenuEditing from "./editing";

export default class controlsMenu extends Plugin {
  static get requires() {
    return [ControlsMenuEditing, ControlsMenuUI];
  }
}
