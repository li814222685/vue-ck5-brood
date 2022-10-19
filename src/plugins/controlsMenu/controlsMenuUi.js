/**
 * @description 处理插件UI逻辑
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { addListToDropdown, createDropdown } from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import SplitButtonView from "@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import Model from "@ckeditor/ckeditor5-ui/src/model";

export default class ControlsMenuUI extends Plugin {
  init() {
    console.log("SimpleBoxUI#init() got called");

    const editor = this.editor;
    const t = editor.t;

    // The "simpleBox" button must be registered among the UI components of the editor
    // to be displayed in the toolbar.
    editor.ui.componentFactory.add("controlsMenu", locale => {
      // The state of the button will be bound to the widget command.
      const command = editor.commands.get("insertSimpleBox");

      // The button will be an instance of ButtonView.
      const buttonView = new ButtonView(locale);

      buttonView.set({
        // The t() function helps localize the editor. All strings enclosed in t() can be
        // translated and change when the language of the editor changes.
        label: t("Simple Box"),
        withText: true,
        tooltip: true,
      });

      // Bind the state of the button to the command.

      // Execute the command when the button is clicked (executed).
      const dropdownView = createDropdown(locale);
      const dropButton = new ButtonView(locale);
      dropdownView.bind("isOn", "isEnabled").to(command, "value", "isEnabled");

      this.listenTo(dropdownView, "execute", () => editor.execute("insertSimpleBox"));

      dropButton.set({
        type: "button",
        model: new Model({
          withText: true,
          label: "插入选择框",
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
