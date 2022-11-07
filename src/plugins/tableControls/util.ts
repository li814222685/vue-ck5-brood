import { DowncastWriter, Element } from "@ckeditor/ckeditor5-engine";
import TableWalker from "@ckeditor/ckeditor5-table/src/tablewalker";
import { toWidget, toWidgetEditable } from "@ckeditor/ckeditor5-widget/src/utils";
import AttributeElement from "@ckeditor/ckeditor5-engine/src/view/attributeelement";
import {
  DATA_VALUE,
  HIDDEN_ITEM,
  RESTRICTED_EDITING,
  THEME_ICON,
  TRIANGlE_DOWN,
  TRIANGlE_UP,
  V_SELECT,
  V_SELECT_DROPDOWN,
  V_SELECT_DROPDOWN_TEXT,
  V_SELECT_DROPDOWN_TEXT_SELE,
  V_SELECT_OPTION_LIST,
  V_SELECT_OPTION_LIST_ITEM,
} from "./constant";
import { EditorClasses } from "../../components/mode/define";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { Option } from "../../components/mode/mitt";

/** Table Cell dataDowncast逻辑重写 */
/**
 * @param {Object} [options]
 * @param {Boolean} [options.asWidget]
 * @returns {Function}
 */
export function converDowncastCell(options = { asWidget: true }) {
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

/** 当前点击的元素是否是限制编辑元素 */
export const isRestrictedElement = (ele: AttributeElement): boolean => {
  //Todo：这里暂时只考虑了Cell内的元素deep 为2，后续可能需要结合需求或者具体场景，使用遍历递归实现
  return [...ele.getClassNames()].includes(EditorClasses.EDITABLE_CLASS);
};

export const createSelect = (writer: Writer, options?: Option[]) => {
  /**最外层容器 */
  const selectContainer = writer.createElement("v-div-c", {
    class: V_SELECT,
    "data-cke-ignore-events": true,
  });

  /**
   * =================================
   */

  /**下拉框*/
  const dropDown = writer.createElement("v-div", {
    class: V_SELECT_DROPDOWN,
    "data-cke-ignore-events": true,
  });
  /**下拉框文字 */
  const dropDown_text = writer.createElement("v-div", {
    class: V_SELECT_DROPDOWN_TEXT,
    id: V_SELECT_DROPDOWN_TEXT,
    contenteditable: true,
  });
  /**图标 */
  const dorpDown_icon = writer.createElement("v-span", {
    id: THEME_ICON,
    class: TRIANGlE_UP,
    contenteditable: false,
  });
  [dropDown_text, dorpDown_icon].forEach(item => {
    writer.append(item, dropDown);
  });

  /**
   * =================================
   */

  /**列表 */
  const optionList = writer.createElement("v-div", { class: V_SELECT_OPTION_LIST });
  (
    options || [
      {
        label: "朝阳区",
        value: "朝阳区",
      },
      {
        label: "海淀区",
        value: "海淀区",
      },
    ]
  ).forEach(({ label, value }) => {
    const optionItem = writer.createElement("v-div", {
      class: V_SELECT_OPTION_LIST_ITEM,
      "data-value": value,
      label,
    });
    writer.appendText(label, optionItem);
    writer.append(optionItem, optionList);
  });

  [dropDown, optionList].forEach(item => {
    writer.append(item, selectContainer);
  });
  return selectContainer;
};

class HTMLDOM extends globalThis.Element {
  onclick?: () => void;
}
/** DOM元素是否为TableSelect */
export const isTableSelect = (dom: HTMLDOM): boolean =>
  [V_SELECT_DROPDOWN_TEXT, V_SELECT_DROPDOWN_TEXT_SELE].some(className =>
    [...dom.classList].includes(className)
  );

/** classString To classSelector  */
export const toClassSelector = (classString: string): string => "." + classString;

/** 处理Table-Select的事件 */
export const handleSelectEvent = (dom: HTMLDOM) => {
  const [
    container,
    dorpdown,
    dropdown_text,
    dropdown_text_sele,
    optionList,
    optionList_item,
    theme_icon,
  ] = [
    V_SELECT,
    V_SELECT_DROPDOWN,
    V_SELECT_DROPDOWN_TEXT,
    V_SELECT_DROPDOWN_TEXT_SELE,
    V_SELECT_OPTION_LIST,
    V_SELECT_OPTION_LIST_ITEM,
    THEME_ICON,
  ].map(selectorString =>
    selectorString === V_SELECT_OPTION_LIST_ITEM
      ? (document.querySelectorAll(toClassSelector(selectorString)) as any)
      : document.querySelector(toClassSelector(selectorString))
  );
  const { onSelectClick, onOptionsClick, bindSelectListener } = SelectClickCollection;

  if (dropdown_text) {
    dropdown_text.onclick = onSelectClick;
  }
  optionList_item.forEach((_, key) => {
    optionList_item[key].onclick = onOptionsClick;
  });

  bindSelectListener(dropdown_text);
};

/** TableSelect Handler */
export const onTableSelect = e => {
  const clickDom = document.elementFromPoint(e.clientX, e.clientY);
  const flag = isTableSelect(clickDom);
  if (flag) {
    handleSelectEvent(clickDom);
  }
};

class SelectClickCollection {
  /** 监听Select点击处理逻辑 */
  static onSelectClick() {
    try {
      if (document.querySelector(".v_select_dropDown_text_sele")) return;

      (document.querySelector(".v_select_optionList") as any).style.display = "block";

      document.querySelector(".v_select_dropDown_text").className = V_SELECT_DROPDOWN_TEXT_SELE;
      document.getElementById("theme_icon").className = TRIANGlE_DOWN;
    } catch (error) {
      console.error(error);
    }
  }
  /** 监听Option点击处理逻辑 */
  static onOptionsClick(event) {
    const target = event.target;
    console.log(target.getAttribute(DATA_VALUE)); //可获取自定义属性值
    const dropdown_text = document.getElementById(V_SELECT_DROPDOWN_TEXT);
    dropdown_text.innerText = target.getAttribute(DATA_VALUE);
    console.log(dropdown_text);
  }
  /** 绑定Select的监听器*/
  static bindSelectListener(dropdownText: HTMLDOM) {
    if (!dropdownText) return;
    //select 失焦处理
    document.onclick = function (event) {
      const target: any = event.target;

      if (target.tagName !== "P" && V_SELECT_DROPDOWN_TEXT_SELE != target.className) {
        if (!document.querySelector(".v_select_optionList")) return;
        (document.querySelector(".v_select_optionList") as any).style.display = "none";
        document.getElementById(V_SELECT_DROPDOWN_TEXT).className = V_SELECT_DROPDOWN_TEXT;
        document.getElementById("theme_icon").className = TRIANGlE_UP;
        console.log("77777777777777");
      }
    };

    /** Select ContentEditable 的onChange 和 Select 的搜索功能*/
    dropdownText.addEventListener("input", e => {
      const target: any = e.target;
      console.log("输入了东西！", target.innerHTML);
      //select value的onchange 以及 value 对 option列表的搜索匹配功能
      const value = target.innerHTML;
      // 1.过滤掉Option 列表内所有未命中 keyWord 的option
      const originOptions = document.querySelectorAll(".v_select_optionList_item");
      const _options = [...originOptions].forEach(opt => {
        //option是否包含关键字
        const isIncludes = opt.innerHTML.includes(value);
        //option 是否隐藏
        if (!isIncludes && !opt.className.includes(HIDDEN_ITEM)) {
          opt.className += " hidden_item";
        } else if (isIncludes) {
          opt.className = opt.className.replace(HIDDEN_ITEM, "");
        }
      });
    });
  }
}
