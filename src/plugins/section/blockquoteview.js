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
} from '@ckeditor/ckeditor5-ui';
import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import { icons } from '@ckeditor/ckeditor5-core';

export default class FormView extends View {
  // 构造器
	constructor( locale ) {
		super( locale );
    // console.log(locale)
    // ui框样式内容
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.abbrInputView = this._createInput( 'Add abbreviation' );
		this.titleInputView = this._createInput( 'Add title' );
		this.saveButtonView = this._createButton( 'Save', icons.check, 'ck-button-save' );
		// Submit type of the button will trigger the submit event on entire form when clicked 
    // 按钮的提交类型将在单击时触发整个表单上的提交事件
		//(see submitHandler() in render() below).
		this.saveButtonView.type = 'submit';
		this.cancelButtonView = this._createButton( 'Cancel', icons.cancel, 'ck-button-cancel' );
		// Delegate ButtonView#execute to FormView#cancel.
    // 将ButtonView#execute委托给FormView#取消
		this.cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );
		this.childViews = this.createCollection( [
			this.saveButtonView,
			this.cancelButtonView,
		] );
		this._focusCycler = new FocusCycler( {
			focusables: this.childViews,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
        // 使用Shift+Tab键向后导航表单字段
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
        // 使用Tab键向前导航表单字段。
				focusNext: 'tab'
			}
		} );
		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [ 'ck', 'ck-section-form' ],
				tabindex: '-1'
			},
			children: this.childViews
		} );
	}
	render() {
		super.render();

		submitHandler( {
			view: this
		} );

		this.childViews._items.forEach( view => {
			// Register the view in the focus tracker.
      // 在焦点跟踪器中注册视图。
			this.focusTracker.add( view.element );
		} );

		// Start listening for the keystrokes coming from #element.
    // 开始监听来自#element的击键
		this.keystrokes.listenTo( this.element );
	}

	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	focus() {
		// If the abbreviation text field is enabled, focus it straight away to allow the user to type.
    // 如果启用了缩写文本字段，请将其直接聚焦以允许用户键入。
		if ( this.abbrInputView.isEnabled ) {
			// this.abbrInputView.focus();
		}
		// Focus the abbreviation title field if the former is disabled.
    // 如果禁用了缩写标题字段，请关注缩写标题字段。
		else {
			// this.titleInputView.focus();
		}
	}

	_createInput( label ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = label;

		return labeledInput;
	}

	_createButton( label, icon, className ) {
		const button = new ButtonView();

		button.set( {
			label,
      // withText: true,
			icon,
			tooltip: true,
			class: className
		} );

		return button;
	}
}