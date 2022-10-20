import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import WidgetToolbarRepository from "@ckeditor/ckeditor5-widget/src/widgettoolbarrepository";
import { getSelectedImageWidget } from "./util";

export default class SelectToolbar extends Plugin {
  static get requires() {
    return [WidgetToolbarRepository];
  }

  afterInit() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);

    widgetToolbarRepository.register("select", {
      items: ["selectToolbar"],
      getRelatedElement: getSelectedImageWidget,
    });
  }
}
