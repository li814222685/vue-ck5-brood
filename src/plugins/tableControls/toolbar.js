import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import WidgetToolbarRepository from "@ckeditor/ckeditor5-widget/src/widgettoolbarrepository";
import { isWidget } from "ckeditor5/src/widget";

import { TABLE_ANCHOR_TOOLBAR, TABLE_ANCHOR_COPY } from "./constant";

export default class TableAnchorToolbar extends Plugin {
  static get requires() {
    return [WidgetToolbarRepository];
  }

  /** 是否为Table Widget */
  isTableWidget(viewElement) {
    return !!viewElement.getCustomProperty("table") && isWidget(viewElement);
  }

  /** 获取选中的Table元素 */
  getTableWidgetAncestor(selection) {
    /** isTableAnchorElement */
    const isTableAnchorElement = blocks => {
      const firstEleParent = blocks[0].parent;
      return (
        blocks.length > 1 && //选中的行/列一定 > 1
        firstEleParent.name === "tableCell" && //第一个元素的父元素modelName 为 tableCell
        firstEleParent.getAttribute("ismetagroup") //第一个元素的父元素 拥有 ismetagroup 属性
      );
    };

    const selectedBlocks = window.editor?.model?.document.selection.getSelectedBlocks();
    if (selectedBlocks && isTableAnchorElement([...selectedBlocks])) {
      const selectionPosition = selection.getFirstPosition();

      if (!selectionPosition) {
        return null;
      }

      let parent = selectionPosition.parent;

      while (parent) {
        if (parent.is("element") && !!parent.getCustomProperty("table") && isWidget(parent)) {
          return parent;
        }

        parent = parent.parent;
      }
    }

    return null;
  }

  afterInit() {
    const editor = this.editor;
    const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);

    widgetToolbarRepository.register(TABLE_ANCHOR_TOOLBAR, {
      items: [TABLE_ANCHOR_TOOLBAR, TABLE_ANCHOR_COPY],
      getRelatedElement: this.getTableWidgetAncestor,
    });
  }
}
