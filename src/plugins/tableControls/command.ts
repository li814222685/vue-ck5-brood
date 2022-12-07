/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import _ from "lodash";
import { COMMAND_NAME__INSERT_TABLE_NORMAL, RESTRICTED_EDITING } from "./constant";
import { createTableSelect, handleSelectEvent, onTableSelect } from "./util";
import { V_SELECT } from "./constant";
import { toClassSelector } from "./util";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import { DowncastWriter } from "@ckeditor/ckeditor5-engine";
import { safeJsonStringify } from "../../components/utils";
import { emitter, SWITCH_ADD_TABLE_MODAL } from "../../components/mode/mitt";

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
    console.log("插入TableCC！！！");
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
      this.editor.editing.view.focus();
      this.editor.execute(RESTRICTED_EDITING);
      writer.setSelection(null);
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "table");

    console.log(
      "%c🍉Lee%cline:99%callowedIn",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(56, 13, 49);padding:3px;border-radius:2px",
      allowedIn
    );
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

//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function isAllowedInParent(selection, schema) {
  const positionParent = selection.getFirstPosition().parent;
  const validParent =
    positionParent === positionParent.root ? positionParent : positionParent.parent;

  return schema.checkChild(validParent, "table");
}

export default {
  TableControlsCommand,
  TableSelectCommand,
  SetTableSelectOptionList,
  InsertWrapperTableCommand,
};
