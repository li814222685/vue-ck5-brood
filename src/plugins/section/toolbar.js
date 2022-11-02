import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import WidgetToolbarRepository from "@ckeditor/ckeditor5-widget/src/widgettoolbarrepository";
import { getSelectedWidget } from "./util";
import { CONTROLS_TOOLBAR ,WIDGET_TOOLBAR_NAME__MENU} from "./constant";

export default class SectionMenu extends Plugin {
  static get requires() {
    return [WidgetToolbarRepository];
  }

  afterInit() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);

    widgetToolbarRepository.register(WIDGET_TOOLBAR_NAME__MENU, {
      items: [WIDGET_TOOLBAR_NAME__MENU],
      getRelatedElement: getSelectedWidget,
    });
  }
}
