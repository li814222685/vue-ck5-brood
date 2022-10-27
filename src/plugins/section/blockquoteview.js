
/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

 import {
  View,
  LabeledFieldView,
  createLabeledInputText,
  ButtonView,
  submitHandler,
  FocusCycler,
  BalloonPanelView,
  // ChildView,
} from "@ckeditor/ckeditor5-ui";
import { FocusTracker, KeystrokeHandler } from "@ckeditor/ckeditor5-utils";
import { icons } from "@ckeditor/ckeditor5-core";
import { emitter, SECTION_MODAL } from "../../components/mode/mitt";

export default class FormView extends View {
  // 构造器
  constructor(locale) {
    super(locale);
    const editor = this.editor;
    // console.log(locale)
    // ui框样式内容
    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();
    this.saveButtonView = this._createButton("Save", icons.check, "ck-button-save");
    this.childViews = this.createCollection([this.saveButtonView]);
    this._focusCycler = new FocusCycler({
      focusables: this.childViews,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        // Navigate form fields backwards using the Shift + Tab keystroke.
        // 使用Shift+Tab键向后导航表单字段
        focusPrevious: "shift + tab",

        // Navigate form fields forwards using the Tab key.
        // 使用Tab键向前导航表单字段。
        focusNext: "tab",
      },
    });
    // 这是啥
    this.setTemplate({
      tag: "form",
      attributes: {
        class: ["ck", "ck-section-form"],
        tabindex: "-1",
      },
      children: this.childViews,
    });
  }
  render() {
    super.render();

    submitHandler({
      view: this,
    });

    this.childViews._items.forEach(view => {
      // Register the view in the focus tracker.
      // 在焦点跟踪器中注册视图。
      this.focusTracker.add(view.element);
    });

    // Start listening for the keystrokes coming from #element.
    // 开始监听来自#element的击键
    this.keystrokes.listenTo(this.element);
  }

  destroy() {
    super.destroy();

    this.focusTracker.destroy();
    this.keystrokes.destroy();
  }

  _createButton(label, icon, className) {
    const button = new ButtonView();  
    button.set({
      withText: true,
      label: "配置",
    });
    this.listenTo(button, "execute", () => {
      emitter.emit(SECTION_MODAL)
    });
    return button;
  }
}
