/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import _, { words } from "lodash";
import { RESTRICTED_EDITING } from "./constant";
import { handleSelectEvent, onTableSelect } from "./util";
import { V_SELECT } from "./constant";
import { toClassSelector } from "./util";
import { safeJsonStringify } from "../../components/utils";
import {
  emitter,
  SWITCH_ADD_TABLE_MODAL,
  SWITCH_SET_TURPLE_MODAL,
} from "../../components/mode/mitt";

interface Option {
  label: string | number;
  value: string | number | boolean;
}

interface NodeConfig {
  type: string;
}
//todo：普通编辑模式下有个bug ，如果删除当前可编辑元素内的所有字符，它不会保留空白区间。
export class TableControlsCommand extends Command {
  execute(option?: NodeConfig) {
    //插入Table CC
    /**
     * 1.改变单元格背景色
     * 2.单元格内部元素全部变为 严格编辑，不再需要范围
     */
    const selection = this.editor.model.document.selection;
    const mapper = this.editor.editing.mapper;
    const tableCell = [...selection.getSelectedBlocks()][0] as any;

    const td = mapper.toViewElement(tableCell.parent);
    this.editor.editing.view.change(writer => {
      writer.setStyle(
        {
          "background-color": "rgba(255, 169, 77, 0.2)",
        },
        td
      );
    });
    //用户选择全部单元格元素时候不再需要执行全选了，二次权限会导致选中当前表格
    if (!_.isEqual(selection.anchor.path.slice(-2), [0, 0])) {
      this.editor.execute("selectAll");
      this.editor.editing.view.focus();
    }
    this.editor.execute(RESTRICTED_EDITING);
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "table");
    // this.isEnabled = allowedIn.name === "tableCell";
    this.isEnabled = true;
  }
}

export class TableSelectCommand extends Command {
  execute() {
    //插入Table Select
    const selection = this.editor.model.document.selection;
    const mapper = this.editor.editing.mapper;
    const tableCell = [...selection.getSelectedBlocks()][0] as any;
    //获取td用来添加样式和属性
    const td = mapper.toViewElement(tableCell.parent);
    this.editor.editing.view.change(writer => {
      writer.setStyle(
        {
          "background-color": "rgba(255, 169, 77, 0.2)",
        },
        td
      );
      writer.setAttribute("type", "select", td);
    });
    //设置td 的 type 属性
    return this.editor.model.change(writer => {
      this.editor.execute("selectAll");
      const paragraph = writer.createElement("paragraph");
      writer.insertText("点击配置Select", paragraph);
      writer.setAttribute("type", "select", tableCell.parent);
      const range = (this.editor.model as any).insertContent(paragraph);
      this.editor.execute("selectAll");
      // this.editor.editing.view.focus();
      this.editor.execute(RESTRICTED_EDITING);
      writer.setSelection(null);
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "table");

    if (allowedIn) {
      this.isEnabled = allowedIn?.name === "tableCell";
    }

    //绑定select 的events
    try {
      const select: any = document?.querySelector(toClassSelector(V_SELECT));

      if (select) {
        handleSelectEvent(select);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export class SetTableSelectOptionList extends Command {
  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "table");

    if (allowedIn) {
      this.isEnabled = allowedIn.name === "tableCell";
    }
  }
  execute(options, target) {
    const model = this.editor.model;

    const selection = this.editor.model.document.selection;
    const tableCell = [...selection.getSelectedBlocks()][0] as any;

    console.log(
      "%c🍉Lee%cline:134%ctableCell",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(118, 77, 57);padding:3px;border-radius:2px",
      tableCell
    );
    //将optionList 存储到 Model 的tableCell上
    model.change(writer => {
      writer.setAttribute("optionlist", safeJsonStringify(options), tableCell.parent);
    });
    //将optionList 存储到 View 的td上

    this.editor.editing.view.change(writer => {
      writer.setAttribute("optionlist", safeJsonStringify(options), target);
    });
  }
}

/** 插入带有Wrapper 的Table */
export class InsertWrapperTableCommand extends Command {
  /**
   * @inheritDoc
   */
  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const schema = model.schema;

    this.isEnabled = isAllowedInParent(selection, schema);
  }

  /**
   * @param {Object} options
   * @param {Number} [options.rows=2]
   * @param {Number} [options.columns=2]
   * @param {Number} [options.headingRows]
   * @param {Number} [options.headingColumns]
   * @fires execute
   */
  execute(options = {} as any) {
    emitter.emit(SWITCH_ADD_TABLE_MODAL);
  }
}

function isAllowedInParent(selection, schema) {
  const positionParent = selection.getFirstPosition().parent;
  const validParent =
    positionParent === positionParent.root ? positionParent : positionParent.parent;

  return schema.checkChild(validParent, "table");
}

/** 复制table行命令 */
export class SetTurpleCommand extends Command {
  order: string;
  constructor(editor, options = {} as any) {
    super(editor);
    this.order = options.order || "below";
  }

  refresh() {
    const selection = this.editor.model.document.selection;
    const tableUtils = this.editor.plugins.get("TableUtils");
    const model = this.editor.model;

    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "table");

    if (allowedIn?.name == "tableCell") {
      const { row, column } = tableUtils.getCellLocation(allowedIn) as any;
      this.isEnabled = row == 0 || column == 0;
    }
  }

  execute() {
    const selection = this.editor.model.document.selection;
    const anchorEle = [...selection.getSelectedBlocks()][0].parent;

    emitter.emit(SWITCH_SET_TURPLE_MODAL, anchorEle);
  }
}

/** 复制table行命令 */
export class CopyRowCommand extends Command {
  order: string;
  constructor(editor, options = {} as any) {
    super(editor);
    this.order = options.order || "below";
  }

  refresh() {
    const selection = this.editor.model.document.selection;
    const tableUtils = this.editor.plugins.get("TableUtils");
    const model = this.editor.model;

    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "table");

    if (allowedIn?.name == "tableCell") {
      const { row, column } = tableUtils.getCellLocation(allowedIn) as any;
      this.isEnabled = row == 0 || column == 0;
    }
  }

  execute(model: "row" | "col") {
    const editor = this.editor;
    const selection = editor.model.document.selection;
    const tableUtils = editor.plugins.get("TableUtils");
    const insertAbove = this.order === "above";

    const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection as any);
    const rowIndexes = tableUtils.getRowIndexes(affectedTableCells);

    const row = insertAbove ? rowIndexes.first : rowIndexes.last;
    const table = affectedTableCells[0].findAncestor("table");

    tableUtils.insertRows(table, {
      at: insertAbove ? row : row + 1,
      copyStructureFromAbove: true,
    });
  }
}

/** 复制table列命令 */

export class CleanControlsCommand extends Command {
  // refresh() {
  //   const model = this.editor.model;
  //   const selection = model.document.selection;
  //   const schema = model.schema;

  //   this.isEnabled = isAllowedInParent(selection, schema);
  // }

  execute(options = {} as any) {
    const selection = this.editor.model.document.selection;
    const mapper = this.editor.editing.mapper;
    const tableCell = [...selection.getSelectedBlocks()][0].parent as any;
    const td = mapper.toViewElement(tableCell);
    this.editor.model.change(writer => {
      writer.removeAttribute("style", tableCell);
      writer.removeAttribute("tableCellBackgroundColor", tableCell);
      writer.removeAttribute("type", tableCell);
      writer.removeAttribute("optionlist", tableCell);
    });

    this.editor.editing.view.change(() => {
      (td as any)._removeStyle("background-color");
    });
    this.editor.execute("selectAll");
    this.editor.execute("restrictedEditingException");
  }
}

export default {
  SetTurpleCommand,
  CopyRowCommand,
  TableControlsCommand,
  TableSelectCommand,
  SetTableSelectOptionList,
  InsertWrapperTableCommand,
  CleanControlsCommand,
};
