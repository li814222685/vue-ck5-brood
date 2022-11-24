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
} from "./constant";

export default class TableControlsUI extends Plugin {
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

      const items = new Collection();
      items.add(dropButton);
      items.add(insertSelectBtn);

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
