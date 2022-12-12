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
  TABLE_ANCHOR_COPY,
  COMMAND_NAME__TABLE_HANDLER,
  COMMAND_NAME__COPY_ROW_ABOVE,
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

/** 限制模式下：创建Table的周边锚点 */
export const createTableAnchorToolbar = context => {
  const { editor } = context;
  editor.ui.componentFactory.add(TABLE_ANCHOR_TOOLBAR, locale => {
    try {
      // const command = editor.commands.get("insertSelect");

      const dropButton = new ButtonView(locale);
      // dropButton.bind("isOn", "isEnabled").to(command, "value", "isEnabled");

      dropButton.set({
        withText: true,
        label: "-_-",
        cmd: COMMAND_NAME__SET_TURPLE_TABLE,
      });

      context.listenTo(dropButton, "execute", ({ source }) => {
        console.log("copy");
      });

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });

  editor.ui.componentFactory.add(TABLE_ANCHOR_COPY, locale => {
    try {
      const command = editor.commands.get("insertTableRowAbove");

      const dropButton = new ButtonView(locale);
      dropButton.bind("isOn").to(command);

      dropButton.set({
        withText: true,
        label: "删除",
      });

      context.listenTo(dropButton, "execute", ({ source }) => {
        const selection = editor.model.document.selection;
        const tableUtils = editor.plugins.get("TableUtils");

        const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const rowIndexes = tableUtils.getRowIndexes(affectedTableCells);

        const row = rowIndexes.first;
        const table = affectedTableCells[0].findAncestor("table");
        const targetRow = _.cloneDeep(table.getChild(row));

        // tableUtils.insertRows(table, {
        //   at: row,
        // });
        tableUtils.removeRows(table, {
          at: row,
          rows: 1,
        });
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

    createTableAnchorToolbar(this);
  }
}

export default {
  TableControlsUI,
  TableTurpleUI,
};
