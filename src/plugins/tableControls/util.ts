import { Element } from "@ckeditor/ckeditor5-engine";
import TableWalker from "@ckeditor/ckeditor5-table/src/tablewalker";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import AttributeElement from "@ckeditor/ckeditor5-engine/src/view/attributeelement";
import { RESTRICTED_EDITING } from "./constant";
import { EditorClasses } from "../../components/mode/define";

/** Table Cell dataDowncast逻辑重写 */
/**
 * @param {Object} [options]
 * @param {Boolean} [options.asWidget]
 * @returns {Function}
 */
export function converDowncastCell(options = {}) {
  return (tableCell, { writer }) => {
    const tableRow = tableCell.parent;
    const table = tableRow.parent;
    const rowIndex = table.getChildIndex(tableRow);

    const tableWalker: any = new TableWalker(table, { row: rowIndex });
    const headingRows = table.getAttribute("headingRows") || 0;
    const headingColumns = table.getAttribute("headingColumns") || 0;

    for (const tableSlot of tableWalker) {
      if (tableSlot.cell == tableCell) {
        const isHeading = tableSlot.row < headingRows || tableSlot.column < headingColumns;
        const cellElementName = isHeading ? "th" : "td";
        const element = (options as any).asWidget
          ? toWidgetEditable(writer.createEditableElement(cellElementName), writer)
          : writer.createContainerElement(cellElementName);
        //给output的th or td添加背景样式
        if (isCellChildHasRestricted(tableCell)) {
          writer.setStyle(
            {
              "background-color": "rgba(255, 169, 77, 0.2)",
            },
            element
          );
        }
        return element;
      }
    }
  };
}

/** Cell中是否含有限制🚫编辑元素 */
const isCellChildHasRestricted = (ele: Element): any => {
  console.log(ele);
  //Todo：这里暂时只考虑了Cell内的元素deep 为2，后续可能需要结合需求或者具体场景，使用遍历递归实现
  const content = (ele.getChild(0) as Element).getChild(0);
  return (content as any)?._attrs.has(RESTRICTED_EDITING);
};

/** 当前点击的元素是否是限制编辑元素 */
export const isRestrictedElement = (ele: AttributeElement): boolean => {
  //Todo：这里暂时只考虑了Cell内的元素deep 为2，后续可能需要结合需求或者具体场景，使用遍历递归实现
  return [...ele.getClassNames()].includes(EditorClasses.EDITABLE_CLASS);
};
