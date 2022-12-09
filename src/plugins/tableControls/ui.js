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
} from "./constant";

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

      createTableAnchorToolbar(this);
      return buttonView;
    });
  }
}

export const createTableAnchorToolbar = context => {
  const { editor } = context;
  editor.ui.componentFactory.add(TABLE_ANCHOR_TOOLBAR, locale => {
    // The state of the button will be bound to the widget command.
    try {
      const command = editor.commands.get("insertSelect");

      const dropButton = new ButtonView(locale);
      dropButton.bind("isOn", "isEnabled").to(command, "value", "isEnabled");
      console.log(dropButton);
      console.log(dropButton.set);
      dropButton.set({
        withText: true,
        label: "配置",
      });

      console.log(
        "%c🍉Lee%cline:130%c456456",
        "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
        "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
        "color:#fff;background:rgb(248, 147, 29);padding:3px;border-radius:2px",
        456456
      );
      context.listenTo(dropButton, "execute", val => emitter.emit(SWITCH_MODAL));

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
};

export default {
  TableControlsUI,
  TableTurpleUI,
};
