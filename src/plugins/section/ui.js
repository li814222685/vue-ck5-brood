/**
 * @description 处理插件UI逻辑
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { emitter, SWITCH_MODAL } from "../../components/mode/mitt";

export default class SectionUI extends Plugin {
  init() {
    console.log("SimpleBoxUI#init() got called");

    const editor = this.editor;
    const t = editor.t;

    // The "simpleBox" button must be registered among the UI components of the editor
    // to be displayed in the toolbar.
  }
}

export const createControlsToolbar = context => {
  const { editor } = context;
  editor.ui.componentFactory.add(CONTROLS_TOOLBAR, locale => {
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
      console.log(dropButton);
      context.listenTo(dropButton, "execute", val => emitter.emit(SWITCH_MODAL));

      return dropButton;
    } catch (error) {
      console.error(error);
    }
  });
};
