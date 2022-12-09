import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import WidgetToolbarRepository from "@ckeditor/ckeditor5-widget/src/widgettoolbarrepository";
import { getTableAnchorElemment } from "./util";
import { TABLE_ANCHOR_TOOLBAR } from "./constant";
export default class TableAnchorToolbar extends Plugin {
  static get requires() {
    return [WidgetToolbarRepository];
  }

  /** 判断当前选中区域是否包含Table锚点 */
  isHasAnchorCell(elementCollection) {}

  //获取Table 锚点元素
  getTableAnchorElemment = selection => {
    const elementBlocks = this.editor.model.document.selection.getSelectedBlocks();

    for (const ele of elementBlocks) {
      const target = ele?.parent;

      return target?.name === "tableCell" && target?.getAttribute("ismetagroup") ? target : null;
    }
  };

  afterInit() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);

    console.log(
      "%c🍉Lee%cline:14%c00000",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(38, 157, 128);padding:3px;border-radius:2px",
      666666
    );
    widgetToolbarRepository.register(TABLE_ANCHOR_TOOLBAR, {
      items: [TABLE_ANCHOR_TOOLBAR],
      getRelatedElement: this.getTableAnchorElemment,
    });
  }
}
