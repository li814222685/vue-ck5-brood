import { Element } from "@ckeditor/ckeditor5-engine";
import Selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import { CUSTOM_PROPERTY__SELECT } from "./constant";
import { emitter, GET_OPTIONS, Option } from "../../components/mode/mitt";
import EditableElement from "@ckeditor/ckeditor5-engine/src/view/editableelement";
/** 获取选中的控件 */
export function getSelectedWidget(selection: Selection) {
  const viewElement = selection.getSelectedElement();
  if (viewElement) {
    //获取options
    return viewElement;
  }
  return null;
}
