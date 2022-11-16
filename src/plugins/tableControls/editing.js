/**
 * @description Traverser：注册器 && 转换器
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import {
  converDowncastCell,
  isRestrictedElement,
  isCellHasTableSelect,
  converEditinghDowncastCell,
  createTableSelect,
} from "./util";
import { ClickObserver } from "@ckeditor/ckeditor5-engine";
import {
  COMMAND_NAME__INSERT_TABLE_SELECT,
  COMMAND_NAME__INSERT_TABLE_NORMAL,
  COMMAND_NAME__SET_TABLE_SELECT_OPTIONS,
  V_DIV,
  V_DIV_CONTAINER,
  V_SPAN,
  HIDDEN_ITEM,
} from "./constant";
import { TableControlsCommand, TableSelectCommand, SetTableSelectOptionList } from "./command";
import { V_SELECT } from "./constant";
import { toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import { emitter } from "../../components/mode/mitt";
import {
  SWITCH_MODAL,
  SET_OPTIONS,
  SET_TARGET,
  SAVE_HIDDEN_ITEM,
} from "../../components/mode/mitt";
import { safeJsonParse } from "../../components/utils";

export default class TableControlsEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this._listenToClick();
    this.editor.commands.add(
      COMMAND_NAME__INSERT_TABLE_NORMAL,
      new TableControlsCommand(this.editor)
    );
    this.editor.commands.add(
      COMMAND_NAME__INSERT_TABLE_SELECT,
      new TableSelectCommand(this.editor)
    );
    this.editor.commands.add(
      COMMAND_NAME__SET_TABLE_SELECT_OPTIONS,
      new SetTableSelectOptionList(this.editor)
    );
  }

  _defineSchema() {
    const schema = this.editor.model.schema;
    schema.register(V_DIV_CONTAINER, {
      allowWhere: "$text",
      isObject: true,
      isBlock: true,
      isLimit: true,
      allowAttributes: ["class", "id", "contenteditable", "data-cke-ignore-events"],
    });
    schema.register(V_DIV, {
      allowIn: [V_DIV, V_DIV_CONTAINER],
      isLimit: true,
      allowContentOf: "$root",
      allowAttributes: [
        "class",
        "id",
        "contenteditable",
        "data-value",
        "label",
        "data-cke-ignore-events",
      ],
    });
    schema.extend("tableCell", {
      allowAttributes: ["type", "colspan", "rowspan", "optionList"],
    });
    schema.register(V_SPAN, {
      allowWhere: "$block",
      isInline: true,
      isObject: true,
      allowAttributesOf: "$text",
      allowAttributes: ["class", "id", "contenteditable"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    //TableCell Cover逻辑重写

    conversion.for("editingDowncast").elementToElement({
      model: "tableCell",
      view: converEditinghDowncastCell({ asWidget: true }),
      converterPriority: "highest",
    });
    conversion.for("dataDowncast").elementToElement({
      model: "tableCell",
      view: converDowncastCell(),
      converterPriority: "highest",
      renderUnsafeAttributes: ["optionList", "type", "style"],
    });

    conversion.for("upcast").elementToElement({
      model: (viewEle, { writer }) => writer.createElement("tableCell", viewEle.getAttributes()),
      view: "td",
      converterPriority: "highest",
    });

    conversion.for("upcast").elementToElement({
      model: (viewEle, { writer }) => writer.createElement("tableCell", viewEle.getAttributes()),
      view: "th",
      converterPriority: "highest",
    });

    conversion.for("editingDowncast").elementToElement({
      model: {
        name: V_DIV_CONTAINER,
        classes: V_SELECT,
      },
      view: (modelEle, { writer }) => {
        const container = writer.createContainerElement("div", modelEle.getAttributes());
        return toWidget(container, writer, { hasSelectionHandle: false });
      },
      renderUnsafeAttributes: ["data-cke-ignore-events"],
    });

    conversion.for("editingDowncast").elementToElement({
      model: V_DIV,
      view: (modelEle, { writer }) => {
        return toWidgetEditable(
          writer.createEditableElement("div", modelEle.getAttributes()),
          writer
        );
      },
      renderUnsafeAttributes: ["data-cke-ignore-events"],
    });

    conversion.for("editingDowncast").elementToElement({
      model: V_SPAN,
      view: (modelEle, { writer }) => {
        return writer.createAttributeElement("span", modelEle.getAttributes());
      },
    });

    conversion.for("downcast").attributeToElement({
      model: "restrictedEditingException",
      view: (modelAttributeValue, { writer }) => {
        if (modelAttributeValue) {
          const span = writer.createAttributeElement("span", {
            class: "restricted-editing-exception",
          });
          return span;
        }
      },
      converterPriority: "highest",
    });
  }

  /** Normal模式 Document 监听逻辑 */
  listenClickForNormalMode(target) {
    /** 向上寻找td 的optionList属性 */
    const findOptionListFromAncestorTd = target.findAncestor("td").getAttribute("optionlist");

    console.log(
      "%c🍉Lee%cline:171%cfindOptionListFromAncestorTd",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(251, 178, 23);padding:3px;border-radius:2px",
      findOptionListFromAncestorTd
    );
    if (findOptionListFromAncestorTd) {
      const plainOptionList = safeJsonParse(findOptionListFromAncestorTd);
      emitter.emit(SET_OPTIONS, plainOptionList);
    }
    emitter.emit(SET_TARGET, target.findAncestor("td"));
    //在这里传递当前单元格的select-options
    emitter.emit(SWITCH_MODAL);
  }

  /** Restrict模式 Document 监听逻辑 */
  listenClickForRestrictMode(target, { model, editingView }) {
    new Promise(res => {
      editingView.change(writer => {
        writer.addClass(HIDDEN_ITEM, target);
        res(target);
      });
    }).then(hidEle => {
      model.change(writer => {
        //Todo:这里的插入会导致文字元素被拆分，两种方式解决：
        //1.获取文字元素的end Position
        //2.findOptimalPosition 插入合适位置后，再隐藏和保存文字元素
        const tableSelectRange = model.insertObject(createTableSelect(writer));
        emitter.emit(SAVE_HIDDEN_ITEM, { element: hidEle, range: tableSelectRange });
      });
    });
  }

  _listenToClick() {
    const editor = this.editor;
    const model = editor.model;
    const editingView = editor.editing.view;
    const viewDocument = editor.editing.view.document;
    const selection = model.document.selection;
    const mapper = editor.editing.mapper;

    /** 获取TableControl 插件 配置参数 */
    const tableControlsConfig = editor.config.get("tableControls");

    editingView.addObserver(ClickObserver);
    this.listenTo(viewDocument, "click", (event, data) => {
      const target = data.target;
      const isRestrict = isRestrictedElement(target);
      const isHasTableSelect = isCellHasTableSelect(target);

      if (isRestrict && isHasTableSelect) {
        //通过TableControls的插件配置参数，来决定 绑定哪种模式( Restrict/ Normal)的点击监听
        tableControlsConfig?.isRestrictMode
          ? this.listenClickForRestrictMode(target, { model, editingView })
          : this.listenClickForNormalMode(target);
      }

      // const modelEle = editor.editing.mapper.toModelElement(target);
    });
  }
}
