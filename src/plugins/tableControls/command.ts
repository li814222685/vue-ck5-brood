/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import _ from "lodash";
import { COMMAND_NAME__INSERT_TABLE_NORMAL, RESTRICTED_EDITING } from "./constant";
import { createSelect, handleSelectEvent, onTableSelect } from "./util";
import { V_SELECT } from "./constant";
import { toClassSelector } from "./util";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import { DowncastWriter } from "@ckeditor/ckeditor5-engine";

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
    this.isEnabled = allowedIn.name === "tableCell";
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
      writer.setAttribute("type", "select", td);
    });

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
    console.log(
      "%c🍉Lee%cline:82%c我更新！！！",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(95, 92, 51);padding:3px;border-radius:2px",
      "我更新！！！"
    );
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "table");
    console.log(allowedIn);
    this.isEnabled = allowedIn.name === "tableCell";

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
  execute(options, target) {
    const model = this.editor.model;

    const selection = this.editor.model.document.selection;
    const tableCell = [...selection.getSelectedBlocks()][0] as any;
    console.log(
      "%c🍉Lee%cline:128%cfindTd",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(248, 214, 110);padding:3px;border-radius:2px",
      tableCell
    );
    model.change(writer => {
      writer.setAttribute("optionList", JSON.stringify(options), tableCell.parent);
    });
    this.editor.editing.view.change(writer => {
      writer.setAttribute(
        "optionList",
        JSON.stringify(options),
        target.findAncestor({ name: "td" })
      );
    });
  }
}

export default {
  TableControlsCommand,
  TableSelectCommand,
  SetTableSelectOptionList,
};
