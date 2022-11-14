import { Element } from "@ckeditor/ckeditor5-engine";
import Selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import { CUSTOM_PROPERTY__SELECT, RESTRICTED_CELL_BGCOLOR } from "./constant";
import { emitter, SET_OPTIONS, Option } from "../../components/mode/mitt";
import EditableElement from "@ckeditor/ckeditor5-engine/src/view/editableelement";
import TableWalker from "@ckeditor/ckeditor5-table/src/tablewalker";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import ContainerElement from "@ckeditor/ckeditor5-engine/src/view/containerelement";
import AttributeElement from "@ckeditor/ckeditor5-engine/src/view/attributeelement";
import Text from "@ckeditor/ckeditor5-engine/src/view/text";
import { RESTRICTED_EDITING } from "./constant";

/** 获取选中的控件 */
export function getSelectedWidget(selection: Selection) {
  const viewElement = selection.getSelectedElement();
  if (viewElement && isControls(viewElement)) {
    //获取options
    getOptionsFromSelect(viewElement);
    return viewElement;
  }
  return null;
}
/** 视图元素是否为自定义控件 */
const isControls = (viewElement: Element): boolean => {
  return viewElement.getAttribute(CUSTOM_PROPERTY__SELECT) as boolean;
};

/** 获取当前select元素的options */
const getOptionsFromSelect = (viewElement: Element) => {
  try {
    const options = [...(viewElement.getChild(0) as any)._children].map((opt: EditableElement) => {
      const { label, value } = Object.fromEntries((opt as any)._attrs);
      return {
        label,
        value,
      };
    });
    emitter.emit(SET_OPTIONS, options);
  } catch (error) {
    console.error(error);
  }
};

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
  //Todo：这里暂时只考虑了Cell内的元素deep 为2，后续可能需要结合需求或者具体场景，使用遍历递归实现
  const content = (ele.getChild(0) as Element).getChild(0);
  return (content as any)?._attrs.has(RESTRICTED_EDITING);
};
