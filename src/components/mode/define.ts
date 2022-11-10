import { COMMAND_NAME__INSERT_TABLE_SELECT } from "../../plugins/tableControls/constant";

export const EditorClasses = {
  HIDDEN_CLASS: "hidden-item",
  HIGHLIGHT_CLASS: "restricted-editing-exception_selected",
  EDITABLE_CLASS: "restricted-editing-exception",
  V_SELECT: ".virtual-select",
};
export const UP_CAST = "upcast";
export const DOWN_CAST = "downcast";
export const EDITING_DOWNCAST = "editingDowncast";

enum CellControlsType {
  SELECT = "select",
  DATE_PICKER = "datePicker",
  //...............
}

const isPositionInRangeBoundaries = (range, position) => {
  return (
    range.containsPosition(position) || range.end.isEqual(position) || range.start.isEqual(position)
  );
};

const getMarkerAtPosition = (editor, position) => {
  console.log("%cdefine.ts line:26 323", "color: #007acc;", editor.model.markers);
  //todo:这里获取不到marker
  for (const marker of editor.model.markers) {
    const markerRange = marker.getRange();
    console.log("%cdefine.ts line:28 marker", "color: #007acc;", marker);
    if (isPositionInRangeBoundaries(markerRange, position)) {
      if (marker.name.startsWith("restrictedEditingException:")) {
        return marker;
      }
    }
  }
};

/**
 * @description 全局点击事件
 * @param {event} e
 */
export class onGlobalClick {
  static onClickEntry(e) {
    setTimeout(() => {
      const clickDom = document.elementFromPoint(e.clientX, e.clientY);
      const controlTypeFromCell = onGlobalClick.getCellContentType(clickDom);
      switch (controlTypeFromCell) {
        case CellControlsType.SELECT:
          onGlobalClick.insertSelect();
          break;
        case CellControlsType.DATE_PICKER:
          break;

        default:
          return;
      }
    }, 1);
  }
  static insertSelect() {
    console.log('%cdefine.ts line:58 "我执行了"', "color: #007acc;", "我执行了");
    const editor = (window as any).devEditor;
    const model = editor.model;
    const editing = editor.editing;
    const modelSelection = model.document.selection;
    const marker = getMarkerAtPosition(editor, modelSelection.anchor);
    console.log(marker);
    if (!marker) return;
    const itemEnd = marker.getEnd();
    // replace编辑器指定位置的DOM
    new Promise<void>(res => {
      editing.view.change(writer => {
        const newRange = editor.execute(COMMAND_NAME__INSERT_TABLE_SELECT, itemEnd);
        //缓存将要移除的marker 和 当前的range
        const [oldViewElement] = [...editor.editing.mapper.markerNameToElements(marker.name)];
        writer.addClass(EditorClasses.HIDDEN_CLASS, oldViewElement);
        res();
      });
    });
  }
  static insertDatePicker() {
    //todo:xxxxxxxxxxxx
  }
  /**
   * 获取单元格内容的空间类型
   * @param clickDom
   * @returns {boolean}
   */
  static getCellContentType(clickDom): CellControlsType | void {
    return clickDom.closest("td")?.getAttribute("type") === CellControlsType.SELECT
      ? CellControlsType.SELECT
      : clickDom.closest("td")?.getAttribute("type") === CellControlsType.DATE_PICKER
      ? CellControlsType.DATE_PICKER
      : null;
  }
}
