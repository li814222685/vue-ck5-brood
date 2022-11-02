/**
 * @description 处理插件UI逻辑
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { emitter, SECTION_MODAL } from "../../components/mode/mitt";
import { SECTION_TOOLBAR, COMMAND_NAME__INSERT_SECTION,WIDGET_TOOLBAR_NAME__MENU } from "./constant";
import { ContextualBalloon, clickOutsideHandler, BalloonPanelView} from '@ckeditor/ckeditor5-ui';

export default class SectionUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;
    this._balloon = this.editor.plugins.get( ContextualBalloon );
    editor.ui.componentFactory.add(SECTION_TOOLBAR, locale => {
      const command = editor.commands.get(COMMAND_NAME__INSERT_SECTION);
      const buttonView = new ButtonView(locale);
      buttonView.bind("value","isEnabled").to(command,"value", "isEnabled");
      this.listenTo(buttonView, "execute", () =>{ editor.execute(COMMAND_NAME__INSERT_SECTION)
        // editor.editing.view.focus();
      });
      buttonView.set({
        withText: true,
        label: "插入Section",
      });
      return buttonView;
    });
    this.buttonView = this._createButtonView();
    this._enableUserBalloonInteractions()
  }
  _createButtonView() {
    const editor = this.editor;
    const command = editor.commands.get(COMMAND_NAME__INSERT_SECTION);
    const buttonView = new ButtonView(editor.locale);
    buttonView.bind("isOn", "isEnabled").to(command, "value", "isEnabled");
    buttonView.set({
      withText: true,
      label: "配置",
    });
    this.listenTo(buttonView, "execute",val => {console.log(321) ,emitter.emit(SECTION_MODAL)})
    clickOutsideHandler({
      emitter: buttonView,
      activator: () => this._balloon.visibleView === buttonView,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideUI(),
    });
    return buttonView;
  }
  /** 初始化插入toolbar 判断显示 */
  _enableUserBalloonInteractions() {
    const viewDocument = this.editor.editing.view.document;
    // 点击标记触发ui界面
    this.listenTo(viewDocument, "click", () => {
      const parentLink = this._getSelectedLinkElement();
      // 判断当前标记类型
      console.log(this._getSelectedLinkElement());
      if (parentLink) {
        // this._showUI();
      }
    });
  }
  /** 显示toolbar */
  _showUI() {
		this._balloon.add( {
			view: this.buttonView,
			position: this._getBalloonPositionData()
		} );
		// this.buttonView.focus();
	}
  /** 隐藏toolbar */
  _hideUI() {
		this._balloon.remove( this.buttonView );
		this.editor.editing.view.focus();
	}
  /** 视图选择范围转换为DOM  并设置目标位置 */
  _getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;
		target = () => view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );
    console.log(viewDocument.selection.getFirstRange() );
		return {
			target
		};
	}
  /** 获取选中的element判断类型 */
  _getSelectedLinkElement() {
    const view = this.editor.editing.view;
    const selection = view.document.selection;
    const selectedElement = selection.getSelectedElement();
    if (selection.isCollapsed || (selectedElement && selection.is("view:element"))) {
      return findLinkElementAncestor(selection.getLastPosition());
    } else {
      const range = selection.getFirstRange().getTrimmed();
      const startLink = findLinkElementAncestor(range.start);
      const endLink = findLinkElementAncestor(range.end);
      if (!startLink || startLink != endLink) {
        return null;
      }
      if (view.createRangeIn(startLink).getTrimmed().isEqual(range)) {
        return startLink;
      } else {
        return null;
      }
    }
  }
}
/** 是否为editableElement 并且为section */
function findLinkElementAncestor( position ) {
	return position.getAncestors().find( ancestor =>
    ancestor.is( 'editableElement' ) && ancestor.name =='section'
     );
}
// export const createSectionToolbar = context => {
//   const { editor } = context;
//   editor.ui.componentFactory.add(WIDGET_TOOLBAR_NAME__MENU, locale => {
//     // The state of the button will be bound to the widget command.
//     try {
//       const command = editor.commands.get(COMMAND_NAME__INSERT_SECTION);

//       const dropButton = new ButtonView(locale);
//       dropButton.bind("isOn", "isEnabled").to(command, "value", "isEnabled");
//       console.log(dropButton);
//       console.log(dropButton.set);
//       dropButton.set({
//         withText: true,
//         label: "配置",
//       });
//       console.log(dropButton);
//       context.listenTo(dropButton, "execute", val => emitter.emit(SWITCH_MODAL));

//       return dropButton;
//     } catch (error) {
//       console.error(error);
//     }
//   });
// };

