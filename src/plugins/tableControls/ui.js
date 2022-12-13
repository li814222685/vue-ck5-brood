/**
 * @description 处理插件UI逻辑
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { addListToDropdown, createDropdown } from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import Model from "@ckeditor/ckeditor5-ui/src/model";
import {
  COMMAND_NAME__INSERT_TABLE_NORMAL,
  COMMAND_NAME__INSERT_TABLE_SELECT,
  TABLE_CC_TOOLBAR,
  TABLE_TURPLE_TOOLBAR,
  COMMAND_NAME__INSERT_WRAPPER_TABLE,
  COMMAND_NAME__SET_TURPLE_TABLE,
  TABLE_ANCHOR_TOOLBAR,
  TABLE_ANCHOR_DEL,
  COMMAND_NAME__TABLE_HANDLER,
  COMMAND_NAME__COPY_ROW_ABOVE,
  TABLE_ANCHOR_ROW_BELOW,
  TABLE_ANCHOR_COL_LEFT,
  TABLE_ANCHOR_COL_RIGHT,
  TABLE_ANCHOR_COL_DEL,
} from "./constant";
import _ from "lodash";

export class TableControlsUI extends Plugin {
  init() {
    console.log("TABLE CC UI is Ready!");

    const editor = this.editor;
    const t = editor.t;

    editor.ui.componentFactory.add(TABLE_CC_TOOLBAR, locale => {
      const command = editor.commands.get(COMMAND_NAME__INSERT_TABLE_NORMAL);

      const dropdownView = createDropdown(locale);
      const dropButton = new ButtonView(locale);
      dropdownView.bind("isOn", "isEnabled").to(command, "value", "isEnabled");

      this.listenTo(dropdownView, "execute", ({ source }) => editor.execute(source?.cmd));

      dropButton.set({
        type: "button",
        model: new Model({
          withText: true,
          label: "插入普通CC ( ⌘ / ALT + Z )",
          cmd: COMMAND_NAME__INSERT_TABLE_NORMAL,
        }),
      });

      const insertSelectBtn = new ButtonView(locale);

      insertSelectBtn.set({
        type: "button",
        model: new Model({
          withText: true,
          label: "插入Select ( ⌘ / ALT + X )",
          cmd: COMMAND_NAME__INSERT_TABLE_SELECT,
        }),
      });

      const insertWrapperTableBtn = new ButtonView(locale);
      insertWrapperTableBtn.set({
        type: "button",
        model: new Model({
          withText: true,
          label: "插入 Table ( ⌘ / ALT + T )",
          cmd: COMMAND_NAME__INSERT_WRAPPER_TABLE,
        }),
      });

      const items = new Collection();
      items.add(dropButton);
      items.add(insertSelectBtn);
      items.add(insertWrapperTableBtn);

      dropdownView.buttonView.set({
        withText: true,
        label: "插入TABLE-CC",
      });
      editor.keystrokes.set("ALT+Z", COMMAND_NAME__INSERT_TABLE_NORMAL);
      editor.keystrokes.set("ALT+X", COMMAND_NAME__INSERT_TABLE_SELECT);

      addListToDropdown(dropdownView, items);

      return dropdownView;
    });
  }
}

const isCol = eles => eles.every(ele => ele.parent.name === "tableCell");

/** 限制模式下：创建Table的周边锚点 */
export const createTableRowToolbar = context => {
  const { editor } = context;
  const tableUtils = editor.plugins.get("TableUtils");
  const selection = editor.model.document.selection;

  editor.ui.componentFactory.add(TABLE_ANCHOR_TOOLBAR, locale => {
    try {
      const dropButton = new ButtonView(locale);

      dropButton.set({
        withText: true,
        label: "向上复制一行",
      });

      context.listenTo(dropButton, "execute", ({ source }) => {
        const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const columnIndexes = tableUtils.getColumnIndexes(affectedTableCells);
        const rowIndexes = tableUtils.getRowIndexes(affectedTableCells);
        const table = affectedTableCells[0].findAncestor("table");

        if (columnIndexes.first === columnIndexes.last) {
          //列复制
          editor.model.change(writer => {
            const rows = table.getChildren();
            for (const tableRow of rows) {
              const tableCell = tableRow.getChild(columnIndexes.first);
              const cloneItem = writer.cloneElement(tableCell, true);
              writer.insert(cloneItem, tableRow, columnIndexes.first);
            }
            // const cloneItem = writer.cloneElement(tr, true);
          });
        } else {
          //行复制
          editor.model.change(writer => {
            const tr = table.getChild(rowIndexes.first);
            const cloneItem = writer.cloneElement(tr, true);
            writer.insert(cloneItem, table, rowIndexes.first);
          });
        }
      });

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
  editor.ui.componentFactory.add(TABLE_ANCHOR_ROW_BELOW, locale => {
    try {
      const dropButton = new ButtonView(locale);

      dropButton.set({
        withText: true,
        label: "向下复制一行",
      });

      context.listenTo(dropButton, "execute", ({ source }) => {
        const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const rowIndexes = tableUtils.getRowIndexes(affectedTableCells);
        const table = affectedTableCells[0].findAncestor("table");

        editor.model.change(writer => {
          const tr = table.getChild(rowIndexes.first);
          const cloneItem = writer.cloneElement(tr, true);
          writer.insert(cloneItem, table, rowIndexes.first + 1);
        });
      });

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
  editor.ui.componentFactory.add(TABLE_ANCHOR_DEL, locale => {
    try {
      const dropButton = new ButtonView(locale);

      dropButton.set({
        withText: true,
        label: "删除",
        cmd: "insertTableRowAbove",
      });

      context.listenTo(dropButton, "execute", ({ source }) => {
        const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const rowIndexes = tableUtils.getRowIndexes(affectedTableCells);

        const table = affectedTableCells[0].findAncestor("table");

        editor.model.change(writer => {
          const tr = table.getChild(rowIndexes.first);
          writer.remove(tr);
        });
      });

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
};

const createTableColToolbar = context => {
  const { editor } = context;
  const tableUtils = editor.plugins.get("TableUtils");
  const selection = editor.model.document.selection;

  editor.ui.componentFactory.add(TABLE_ANCHOR_COL_LEFT, locale => {
    try {
      const dropButton = new ButtonView(locale);
      dropButton.set({
        withText: true,
        label: "向左复制一列",
      });

      context.listenTo(dropButton, "execute", ({ source }) => {
        const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const columnIndexes = tableUtils.getColumnIndexes(affectedTableCells);
        const table = affectedTableCells[0].findAncestor("table");
        //列复制
        editor.model.change(writer => {
          const rows = table.getChildren();
          for (const tableRow of rows) {
            const tableCell = tableRow.getChild(columnIndexes.first);
            const cloneItem = writer.cloneElement(tableCell, true);
            writer.insert(cloneItem, tableRow, columnIndexes.first);
          }
        });
      });

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
  editor.ui.componentFactory.add(TABLE_ANCHOR_COL_RIGHT, locale => {
    try {
      const dropButton = new ButtonView(locale);
      dropButton.set({
        withText: true,
        label: "向右复制一列",
      });
      context.listenTo(dropButton, "execute", ({ source }) => {
        const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const columnIndexes = tableUtils.getColumnIndexes(affectedTableCells);
        const table = affectedTableCells[0].findAncestor("table");
        //列复制
        editor.model.change(writer => {
          const rows = table.getChildren();
          for (const tableRow of rows) {
            const tableCell = tableRow.getChild(columnIndexes.first);
            const cloneItem = writer.cloneElement(tableCell, true);
            writer.insert(cloneItem, tableRow, columnIndexes.first + 1);
          }
        });
      });
      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
  editor.ui.componentFactory.add(TABLE_ANCHOR_COL_DEL, locale => {
    try {
      const dropButton = new ButtonView(locale);
      dropButton.set({
        withText: true,
        label: "删除",
        cmd: "removeTableColumn",
      });
      context.listenTo(dropButton, "execute", ({ source }) => {
        editor.execute(source.cmd);
      });

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
};
export class TableTurpleUI extends Plugin {
  init() {
    console.log("TableTurpleUI is Ready!");

    const editor = this.editor;
    const t = editor.t;

    editor.ui.componentFactory.add(TABLE_TURPLE_TOOLBAR, locale => {
      const command = editor.commands.get(COMMAND_NAME__SET_TURPLE_TABLE);

      const buttonView = new ButtonView(locale);

      buttonView.set({
        // The t() function helps localize the editor. All strings enclosed in t() can be
        // translated and change when the language of the editor changes.
        label: t("元组"),
        withText: true,
        tooltip: true,
        cmd: COMMAND_NAME__SET_TURPLE_TABLE,
      });

      buttonView.bind("isOn", "isEnabled").to(command, "value", "isEnabled");

      this.listenTo(buttonView, "execute", ({ source }) => editor.execute(source?.cmd));

      return buttonView;
    });

    createTableRowToolbar(this);
    createTableColToolbar(this);
  }
}

export default {
  TableControlsUI,
  TableTurpleUI,
};
