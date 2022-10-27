import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import WidgetToolbarRepository from "@ckeditor/ckeditor5-widget/src/widgettoolbarrepository";
import { getSelectedWidget } from "./util";
import { CONTROLS_TOOLBAR } from "./constant";

export default class SectionMenu extends Plugin {
  static get requires() {
    return [WidgetToolbarRepository];
  }

  afterInit() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);

    widgetToolbarRepository.register(CONTROLS_TOOLBAR, {
      items: [CONTROLS_TOOLBAR],
      getRelatedElement: getSelectedWidget,
    });
  }
}
