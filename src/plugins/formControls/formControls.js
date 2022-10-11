/**
 * @description Plugin Entry
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FormControlsEditing from "./formControlsEditing";
import FormControlsUI from "./formControlsUi";

export default class FormControls extends Plugin {
  static get requires() {
    return [FormControlsEditing, FormControlsUI];
  }
}
