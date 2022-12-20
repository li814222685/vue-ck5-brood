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

/**创建删除按钮 */
const createRemoveButton = (context, uiName, cmd) => {
  const editor = context.editor;
  editor.ui.componentFactory.add(uiName, locale => {
    try {
      const dropButton = new ButtonView(locale);
      dropButton.set({
        withText: true,
        label: "删除",
        cmd,
      });
      context.listenTo(dropButton, "execute", ({ source }) => editor.execute(source.cmd));

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
};
/**创建行锚点toolbar按钮 */
const createAnchorRowBtn = ({ context, uiName, label, extraNumber }) => {
  const { editor } = context;
  const tableUtils = editor.plugins.get("TableUtils");
  const selection = editor.model.document.selection;

  editor.ui.componentFactory.add(uiName, locale => {
    try {
      const dropButton = new ButtonView(locale);

      dropButton.set({
        withText: true,
        label,
      });

      context.listenTo(dropButton, "execute", ({ source }) => {
        const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const rowIndexes = tableUtils.getRowIndexes(affectedTableCells);
        const table = affectedTableCells[0].findAncestor("table");
        //行复制
        editor.model.change(writer => {
          const tr = table.getChild(rowIndexes.first);
          const cloneItem = writer.cloneElement(tr, true);
          writer.insert(cloneItem, table, rowIndexes.first + extraNumber);
          const maxMarkerNumber = editor.model.markers._markers.size;

          [...cloneItem.getChildren()].forEach((cell, index) => {
            [...cell.getChildren()].forEach(content => {
              const path = content.getPath();
              const child = content.getChild(0);
              if (child) {
                const start = writer.createPositionBefore(child);
                const end = writer.createPositionAfter(child);
                const range = writer.createRange(start, end);
                writer.addMarker(`restrictedEditingException:${maxMarkerNumber + index + 1}`, {
                  range,
                  usingOperation: true,
                  affectsData: true,
                });
              }

              // const end = writer.createPositionAfter(content.getChild(0));

              // const start = writer.createPositionBefore(content);
              // const after = writer.createPositionAfter(content);

              // console.log(
              //   "%cMyProject%cline:149%cstart",
              //   "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
              //   "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
              //   "color:#fff;background:rgb(251, 178, 23);padding:3px;border-radius:2px",
              //   start
              // );
              // const range = writer.createRange(start, after);
              // writer.addMarker(`restrictedEditingException:${maxMarkerNumber + index + 1}`, {
              //   range,
              //   usingOperation: true,
              //   affectsData: true,
              // });
            });
            console.log(
              "%cMyProject%cline:147%ccell",
              "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
              "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
              "color:#fff;background:rgb(248, 147, 29);padding:3px;border-radius:2px",
              cell
            );
          });
        });
      });
      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
};

/** 限制模式下：创建Table锚点行气球菜单*/
const createTableRowToolbar = context => {
  [
    {
      uiName: TABLE_ANCHOR_TOOLBAR,
      label: "向上复制一行",
      extraNumber: 0,
      context,
    },
    {
      uiName: TABLE_ANCHOR_ROW_BELOW,
      label: "向下复制一行",
      extraNumber: 1,
      context,
    },
  ].forEach(item => {
    createAnchorRowBtn(item);
  });

  createRemoveButton(context, TABLE_ANCHOR_DEL, "removeTableRow");
};

/** 创建Col 锚点按钮 */
const createAnchorColBtn = ({ context, uiName, label, extraNumber }) => {
  const { editor } = context;
  const tableUtils = editor.plugins.get("TableUtils");
  const selection = editor.model.document.selection;
  editor.ui.componentFactory.add(uiName, locale => {
    try {
      const dropButton = new ButtonView(locale);
      dropButton.set({
        withText: true,
        label,
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
            writer.insert(cloneItem, tableRow, columnIndexes.first + extraNumber);
            const maxMarkerNumber = editor.model.markers._markers.size;

            [...cloneItem.getChildren()].forEach((cell, index) => {
              console.log("cell:", cell);

              [...cell.getChildren()].forEach(content => {
                if (content) {
                  const start = writer.createPositionBefore(content);
                  const end = writer.createPositionAfter(content);
                  const range = writer.createRange(start, end);

                  const emptyText = writer.createElement("paragraph");
                  writer.appendText(" ", emptyText);

                  editor.model.insertObject(emptyText, range);
                  writer.addMarker(`restrictedEditingException:${maxMarkerNumber + index + 1}`, {
                    range,
                    usingOperation: true,
                    affectsData: true,
                  });
                }
              });
            });
          }
        });
      });

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
};
/** 限制模式下：创建Table锚点列气球菜单*/
const createTableColToolbar = context => {
  [
    {
      uiName: TABLE_ANCHOR_COL_LEFT,
      label: "向左复制一列",
      extraNumber: 0,
      context,
    },
    {
      uiName: TABLE_ANCHOR_COL_RIGHT,
      label: "向右复制一列",
      extraNumber: 1,
      context,
    },
  ].forEach(item => {
    createAnchorColBtn(item);
  });
  createRemoveButton(context, TABLE_ANCHOR_COL_DEL, "removeTableColumn");
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
