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
  downcastTable,
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
  V_SELECT_DROPDOWN_TEXT,
  COMMAND_NAME__INSERT_WRAPPER_TABLE,
  COMMAND_NAME__COPY_TABLE_ROW,
  COMMAND_NAME__SET_TURPLE_TABLE,
  COMMAND_NAME__TABLE_HANDLER,
  COMMAND_NAME__CLEAN_CONTROLS,
} from "./constant";
import {
  TableControlsCommand,
  TableSelectCommand,
  SetTableSelectOptionList,
  InsertWrapperTableCommand,
  SetTurpleCommand,
  CleanControlsCommand,
} from "./command";
import { V_SELECT } from "./constant";
import { toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import { emitter, REPLACE_HIDDEN_ITEM_TEXT } from "../../components/mode/mitt";
import {
  SWITCH_MODAL,
  SET_OPTIONS,
  SET_TARGET,
  SAVE_HIDDEN_ITEM,
} from "../../components/mode/mitt";
import { safeJsonParse, safeJsonStringify } from "../../components/utils";
import { getMarkerAtPosition } from "@/plugins/formControls/utils.js";
import TableUtils from "@ckeditor/ckeditor5-table/src/tableutils";
import { TableRowAndColHandlertCommand } from "./tableAnchor/command";

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
    this.editor.commands.add(
      COMMAND_NAME__INSERT_WRAPPER_TABLE,
      new InsertWrapperTableCommand(this.editor)
    );
    this.editor.commands.add(COMMAND_NAME__SET_TURPLE_TABLE, new SetTurpleCommand(this.editor));
    this.editor.commands.add(
      COMMAND_NAME__TABLE_HANDLER,
      new TableRowAndColHandlertCommand(this.editor)
    );
    this.editor.commands.add(COMMAND_NAME__CLEAN_CONTROLS, new CleanControlsCommand(this.editor));
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
      inheritAllFrom: "$blockObject",
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
      allowAttributes: [
        "type",
        "colspan",
        "rowspan",
        "optionlist",
        "style",
        "isMetaGroup",
        "ismetagroup",
        "turplename",
      ],
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
      renderUnsafeAttributes: [
        "optionlist",
        "type",
        "style",
        "isMetaGroup",
        "ismetagroup",
        "turplename",
        "ismetagroup",
      ],
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
        // modelEle 是否为 optionItem元素
        const isOptionItem = modelEle.getAttribute("class") === "v_select_optionList_item";
        if (isOptionItem) {
          const element = writer.createEditableElement("div", modelEle.getAttributes());
          writer.setAttribute("contenteditable", "false", element);
          writer.setCustomProperty("widget", true, element);
          element.getFillerOffset = null;
          return element;
        } else {
          return toWidgetEditable(
            writer.createEditableElement("div", modelEle.getAttributes()),
            writer
          );
        }
      },
      renderUnsafeAttributes: ["data-cke-ignore-events"],
    });

    conversion.for("editingDowncast").elementToElement({
      model: V_SPAN,
      view: (modelEle, { writer }) => {
        const isIcon = modelEle.getAttribute("id") === "theme_icon";
        return isIcon
          ? writer.createAttributeElement("i", modelEle.getAttributes())
          : writer.createAttributeElement("span", modelEle.getAttributes());
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
  listenFocusForNormalMode(target) {
    /** 向上寻找td 的optionList属性 */
    const findOptionListFromAncestorTd = target.getAttribute("optionlist");
    const mapper = this.editor.editing.mapper;

    const tableCell = mapper.toModelElement(target);
    const targetSpan = tableCell.getChild(0).getChild(0);

    this.editor.model.change(writer => {
      writer.setSelection(writer.createPositionAfter(targetSpan));
    });
    if (findOptionListFromAncestorTd) {
      const plainOptionList = safeJsonParse(findOptionListFromAncestorTd);
      emitter.emit(SET_OPTIONS, plainOptionList);
    }
    emitter.emit(SET_TARGET, target);
    //在这里传递当前单元格的select-options
    emitter.emit(SWITCH_MODAL);
  }

  /** findMarker */
  findMarkerById(id, editor) {
    let res = null;
    for (const marker of editor.model.markers) {
      if (marker.name === id) {
        res = marker;
      }
    }
    return res;
  }

  /** Restrict模式 点击Document 监听逻辑 */
  listenFocusForRestrictMode(target, { model, editingView }) {
    const findOptionListFromAncestorTd = target?.getAttribute("optionlist");

    const plainOptionList = safeJsonParse(findOptionListFromAncestorTd);
    const targetSpan = target.getChild(0).getChild(0);
    const targetText = targetSpan.getChild(0)._textData;
    const marker = this.findMarkerById(targetSpan.id, this.editor);
    if (!marker && !findOptionListFromAncestorTd) return;
    console.log(
      "%c🍉Lee%cline:259%ctarget",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(229, 187, 129);padding:3px;border-radius:2px",
      targetText
    );
    new Promise(res => {
      editingView.change(writer => {
        writer.addClass(HIDDEN_ITEM, targetSpan);
        res(targetSpan);
      });
    }).then(hidEle => {
      model.change(writer => {
        const targetEndPosition = marker.getEnd();
        const tableSelectRange = model.insertObject(
          createTableSelect(writer, targetText, plainOptionList),
          targetEndPosition,
          null,
          {
            setSelection: "on",
          }
        );

        emitter.emit(SAVE_HIDDEN_ITEM, {
          oldViewElement: hidEle,
          oldMarker: marker,
          newRange: tableSelectRange,
        });
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
    const tableUtils = this.editor.plugins.get(TableUtils);

    /** 获取TableControl 插件 配置参数 */
    const tableControlsConfig = editor.config.get("tableControls");

    editingView.addObserver(ClickObserver);
    this.listenTo(viewDocument, "click", (event, data) => {
      const target = data.target;
      /** 当前点击的是否为锚点 */
      const findAncestorTd = target.findAncestor({ name: "td" });
      if (findAncestorTd) {
        const tableCell = mapper.toModelElement(findAncestorTd);
        const { row, column } = tableUtils.getCellLocation(tableCell);
        //Normal 模式
        if (!tableControlsConfig?.isRestrictMode) {
          if (row == 0) {
            editor.execute("selectTableColumn");
          } else if (column == 0) {
            editor.execute("selectTableRow");
          }
        } else {
          //Restrict 模式
          const isHasMetaGroup = findAncestorTd.hasAttribute("ismetagroup");

          if (isHasMetaGroup) {
            if (row == 0) {
              editor.execute("selectTableColumn");
            } else if (column == 0) {
              try {
                editor.execute("selectTableRow");
              } catch (error) {
                console.error(error);
              }
            }
          }
        }
      }
    });
    this.listenTo(viewDocument, "focus", (event, data) => {
      const td = data.target;
      const isRestrict = isRestrictedElement(td);
      const isHasTableSelect = isCellHasTableSelect(td);

      //Select 相关的逻辑
      if (isRestrict && isHasTableSelect) {
        //通过TableControls的插件配置参数，来决定 绑定哪种模式( Restrict/ Normal)的点击监听
        tableControlsConfig?.isRestrictMode
          ? this.listenFocusForRestrictMode(td, { model, editingView })
          : this.listenFocusForNormalMode(td);
      } else {
        const dropdown_text = document.getElementById(V_SELECT_DROPDOWN_TEXT);
        //Table Select Blur
        //当点击其他文档流时，让Select内的值直接替换 文本元素的文本
        const targetText = safeJsonStringify(dropdown_text?.innerText);
        if (targetText && targetText.replace("\\n", "") != '""') {
          emitter.emit(REPLACE_HIDDEN_ITEM_TEXT, dropdown_text.innerText);
        }
      }
    });
  }
}
