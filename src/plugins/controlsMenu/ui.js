/**
 * @description 处理插件UI逻辑
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { addListToDropdown, createDropdown } from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import Model from "@ckeditor/ckeditor5-ui/src/model";
import { COMMAND_NAME__INSERT_SELECT } from "./constant";

export default class ControlsMenuUI extends Plugin {
  init() {
    console.log("SimpleBoxUI#init() got called");

    const editor = this.editor;
    const t = editor.t;

    // The "simpleBox" button must be registered among the UI components of the editor
    // to be displayed in the toolbar.
    editor.ui.componentFactory.add("controlsMenu", locale => {
      // The state of the button will be bound to the widget command.
      const command = editor.commands.get("insertSelect");

      const dropdownView = createDropdown(locale);
      const dropButton = new ButtonView(locale);
      dropdownView.bind("isOn", "isEnabled").to(command, "value", "isEnabled");

      this.listenTo(dropdownView, "execute", ({ source }) => editor.execute(source?.cmd));

      dropButton.set({
        type: "button",
        model: new Model({
          withText: true,
          label: "插入选择框",
          cmd: COMMAND_NAME__INSERT_SELECT,
        }),
      });

      const items = new Collection();
      items.add(dropButton);

      items.add({
        type: "button",
        model: new Model({
          withText: true,
          label: "插入日期",
        }),
      });
      dropdownView.buttonView.set({
        withText: true,
        label: "插入控件",
      });
      addListToDropdown(dropdownView, items);

      return dropdownView;
    });
  }
}
