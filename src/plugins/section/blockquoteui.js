/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/blockquoteui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import { isWidget,findOptimalInsertionRange } from 'ckeditor5/src/widget';
import { ContextualBalloon, clickOutsideHandler, BalloonPanelView} from '@ckeditor/ckeditor5-ui';
import FormView from './blockquoteview';

import {getRangeText,isLinkElement} from './utils.js';

// import '../theme/blockquote.css';
import './theme/blockquote.css';

/**
 * The block quote UI plugin.
 *
 * It introduces the `'section'` button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BlockQuoteUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BlockQuoteUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
    this._balloon = this.editor.plugins.get( ContextualBalloon );
		this.formView = this._createFormView();

		editor.ui.componentFactory.add( 'section', locale => {
			const command = editor.commands.get( 'section' );
			const buttonView = new ButtonView( locale );
      const panel = new BalloonPanelView( locale );
      // const childView = new ChildView();
      const positions = BalloonPanelView.defaultPositions;
			// buttonView.set( {
			// 	label: t( 'Block quote' ),
			// 	// icon: icons.quote,
			// 	tooltip: true,
			// 	isToggleable: true
			// } );
			buttonView.set( {
        label: t( 'section Box' ),
        withText: true,
        tooltip: true
			} );
      
			// Bind button model to command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( buttonView, 'execute', () => {
				editor.execute( 'section' );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );
    this._enableUserBalloonInteractions();
	}
  _createFormView() {
		const editor = this.editor;
		const formView = new FormView( editor.locale );
		// Execute the command after clicking the "Save" button.
    // 点击“保存”按钮后执行命令。
		this.listenTo( formView, 'submit', () => {
      console.log(2222222222222222)
			// Grab values from the abbreviation and title input fields.
      // 从缩写和标题输入字段中获取值。
			const value = {
				// abbr: formView.abbrInputView.fieldView.element.value,
				// title: formView.titleInputView.fieldView.element.value
			};
      const select = document.querySelector('.section');
      // select.focus();

			editor.execute( 'section', 'submit' );

            // Hide the form view after submit.
            //  Hide the form view after submit.
			this._hideUI();
		} );

		// Hide the form view after clicking the "Cancel" button.
    // 单击“取消”按钮后隐藏窗体视图。
		this.listenTo( formView, 'cancel', () => {
			editor.execute( 'section', 'cancel' );
			this._hideUI();
		} );

		// Hide the form view when clicking outside the balloon.
    // 在引出序号外部单击时隐藏窗体视图。
		clickOutsideHandler( {
			emitter: formView,
			activator: () => this._balloon.visibleView === formView,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideUI()
		} );

		return formView;
	}
  _enableUserBalloonInteractions(){
    const viewDocument = this.editor.editing.view.document;
		// Handle click on view document and show panel when selection is placed inside the link element.
		// Keep panel open until selection will be inside the same link element.
    // 点击标记触发ui界面
		this.listenTo( viewDocument, 'click', () => {
			const parentLink = this._getSelectedLinkElement();
      // 判断当前标记类型
      console.log(this._getSelectedLinkElement())
			if ( parentLink ) {
				// Then show panel but keep focus inside editor editable.
				this._showUI();
			}
    })
  }
  _getSelectedLinkElement() {
    const view = this.editor.editing.view;
    const selection = view.document.selection;
    const selectedElement = selection.getSelectedElement();
    // The selection is collapsed or some widget is selected (especially inline widget).
    // 所选内容被折叠或某些小部件被选中（尤其是内联小部件）
    console.log(selection.getLastPosition())
    // if ( selection.isCollapsed || selectedElement && isWidget( selectedElement ) ) {
    if ( selection.isCollapsed || selectedElement && selection.is( 'view:element' ) ) {
      console.log(findLinkElementAncestor( selection.getLastPosition() ))
      return findLinkElementAncestor( selection.getLastPosition() );
    } else {
      // The range for fully selected link is usually anchored in adjacent text nodes.
      // Trim it to get closer to the actual link element.
      //完全选定链接的范围通常定位在相邻的文本节点中。
      //修剪它以更接近实际的链接元素。
      const range = selection.getFirstRange().getTrimmed();
      const startLink = findLinkElementAncestor( range.start );
      const endLink = findLinkElementAncestor( range.end );
  
      if ( !startLink || startLink != endLink ) {
        return null;
      }
  
      // Check if the link element is fully selected.
      if ( view.createRangeIn( startLink ).getTrimmed().isEqual( range ) ) {
        return startLink;
      } else {
        return null;
      }
    }
  }
  _showUI() {
		const selection = this.editor.model.document.selection;
		// Check the value of the command.
    // 检查命令的值。
		// const commandValue = this.editor.commands.get( 'addAbbreviation' ).value;
		const commandValue = {
      abbr:123,
      title:222
    };

		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		// 选择未折叠时禁用输入
		this.formView.abbrInputView.isEnabled = selection.getFirstRange().isCollapsed;

		// 使用命令的状态（值）填写表单
		if ( commandValue ) {
			this.formView.abbrInputView.fieldView.value = commandValue.abbr;
			this.formView.titleInputView.fieldView.value = commandValue.title;
		}
		// 如果命令没有值，则放入当前选定的文本（未折叠）
		// 在第一个字段中，在这种情况下，清空第二个字段。
		else {
			const selectedText = getRangeText( selection.getFirstRange() );

			this.formView.abbrInputView.fieldView.value = selectedText;
			this.formView.titleInputView.fieldView.value = '';
		}

		this.formView.focus();
	}
  _hideUI() {
		// 清除输入字段值并重置表单
		this.formView.abbrInputView.fieldView.value = '';
		this.formView.titleInputView.fieldView.value = '';
		this.formView.element.reset();

		this._balloon.remove( this.formView );

		// 插入缩写后聚焦编辑视图，以便用户可以开始键入内容
		// right away and keep the editor focused. 马上让编辑集中注意力。
		this.editor.editing.view.focus();
	}
  _getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
    const model = this.editor.model;
		const selection = model.document.selection;
		let target = null;
    const parent = findOptimalInsertionRange(selection,model).start.parent;
    // console.log(parent.root.document)
    // let pars = parent.root.document.selection.getFirstRange()
    // let paa = viewDocument.selection.getFirstRange()
    // console.log(pars.end.parent)
    // console.log(paa.end.parent)
		// 通过将视图选择范围转换为DOM来设置目标位置
		target = () => view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );
    console.log(viewDocument.selection.getFirstRange() );
		return {
			target
		};
	}
}
function findLinkElementAncestor( position ) {
  console.log(position.getAncestors())
	return position.getAncestors().find( ancestor => isLinkElement( ancestor ));
}