/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import _ from "lodash";
import { RESTRICTED_EDITING } from "./constant";
import { createSelect } from "./util";

interface Option {
  label: string | number;
  value: string | number | boolean;
}
//todo：普通编辑模式下有个bug ，如果删除当前可编辑元素内的所有字符，它不会保留空白区间。
export class TableControlsCommand extends Command {
  execute() {
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
      console.log("我又全选了！");
      this.editor.execute("selectAll");
      this.editor.editing.view.focus();
    }
    this.editor.execute(RESTRICTED_EDITING);
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "table");
    this.isEnabled = true;
  }
}

export class TableSelectCommand extends Command {
  execute() {
    //插入Table Select

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
    if (!_.isEqual(selection.anchor.path.slice(-2), [0, 0])) {
      console.log("我又全选了！");
      this.editor.execute("selectAll");
      this.editor.editing.view.focus();
    }
    return this.editor.model.change(writer => {
      return (this.editor.model as any).insertObject(createSelect(writer));
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "table");
    this.isEnabled = true;
  }
}

export default {
  TableControlsCommand,
  TableSelectCommand,
};
