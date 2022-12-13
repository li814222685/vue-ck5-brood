import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import WidgetToolbarRepository from "@ckeditor/ckeditor5-widget/src/widgettoolbarrepository";
import { isWidget } from "ckeditor5/src/widget";

import {
  TABLE_ANCHOR_COL_DEL,
  TABLE_ANCHOR_COL_RIGHT,
  TABLE_ANCHOR_COL_LEFT,
  TABLE_ANCHOR_COL_TOOLBAR,
} from "./constant";

export default class TableAnchorColToolbar extends Plugin {
  static get requires() {
    return [WidgetToolbarRepository];
  }

  /** 是否为Table Widget */
  isTableWidget(viewElement) {
    return !!viewElement.getCustomProperty("table") && isWidget(viewElement);
  }

  /** 获取选中的Table元素 */
  getTableWidgetAncestor(selection, tableUtils) {
    /** isTableAnchorElement */
    const isTableAnchorElement = blocks => {
      const firstEleParent = blocks[0].parent;
      try {
        const { row } = tableUtils.getCellLocation(firstEleParent);
        return (
          row === 0 &&
          blocks.length > 1 && //选中的行/列一定 > 1
          firstEleParent.name === "tableCell" && //第一个元素的父元素modelName 为 tableCell
          firstEleParent.getAttribute("ismetagroup") //第一个元素的父元素 拥有 ismetagroup 属性
        );
      } catch (error) {
        return false;
      }
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
    const tableUtils = editor.plugins.get("TableUtils");

    try {
      ["removeTableColumn"].forEach(cmd => {
        this.editor.plugins.get("RestrictedEditingModeEditing").enableCommand(cmd);
      });
    } catch (error) {}

    widgetToolbarRepository.register(TABLE_ANCHOR_COL_TOOLBAR, {
      items: [TABLE_ANCHOR_COL_LEFT, TABLE_ANCHOR_COL_RIGHT, TABLE_ANCHOR_COL_DEL],
      getRelatedElement: selection => this.getTableWidgetAncestor(selection, tableUtils),
    });
  }
}
