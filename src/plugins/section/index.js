/**
 * @description Plugin Entry
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import SectionUI from "./ui";
import SectionEditing from "./editing";

export default class Section extends Plugin {
  static get requires() {
    return [SectionEditing, SectionUI];
  }
}
