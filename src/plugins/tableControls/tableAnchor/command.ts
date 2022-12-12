/**
 * @description Table anchor Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { COMMAND_NAME__COPY_ROW_ABOVE, COMMAND_NAME__COPY_ROW_BELOW } from "../constant";
import _ from "lodash";

interface HandlerConfig {
  handleType: "row" | "col";
  direct: "up" | "down" | "left" | "right" | "delete";
}

/** 删除Table 当前行 / 当前列  */
const removeTarget = (handleType, editor) => {
  handleType === "row" ? editor.execute("removeTableRow") : editor.execute("removeTableColumn");
};

/** addRow */
const addRow = (direct, editor) => {};

/** 操作Table 行/列指令 */
export class TableRowAndColHandlertCommand extends Command {
  execute(config: HandlerConfig) {
    const selection = this.editor.model.document.selection;
    const mapper = this.editor.editing.mapper;

    const { handleType, direct } = config;

    switch (handleType) {
      case "row":
        //行删除
        if (direct === "delete") {
          removeTarget(handleType, this.editor);
          break;
        }

        addRow(direct, this.editor);
        break;
      case "col":
        //列删除
        if (direct === "delete") {
          removeTarget(handleType, this.editor);
        }
        break;
    }

    // this.editor.execute();
  }
}

export default {
  TableRowAndColHandlertCommand,
};
