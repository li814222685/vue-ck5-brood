import { Element } from "@ckeditor/ckeditor5-engine";
import Selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import { CUSTOM_PROPERTY__SELECT } from "./constant";
import { emitter, GET_OPTIONS, Option } from "../../components/mode/mitt";
import EditableElement from "@ckeditor/ckeditor5-engine/src/view/editableelement";
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
    emitter.emit(GET_OPTIONS, options);
  } catch (error) {
    console.error(error);
  }
};
