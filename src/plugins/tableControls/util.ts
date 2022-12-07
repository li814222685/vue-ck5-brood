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
  V_DIV,
  V_DIV_CONTAINER,
  V_SELECT,
  V_SELECT_DROPDOWN,
  V_SELECT_DROPDOWN_TEXT,
  V_SELECT_DROPDOWN_TEXT_SELE,
  V_SELECT_OPTION_LIST,
  V_SELECT_OPTION_LIST_ITEM,
  V_SPAN,
} from "./constant";
import { EditorClasses } from "../../components/mode/define";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { emitter, Option, REPLACE_HIDDEN_ITEM_TEXT } from "../../components/mode/mitt";
import _ from "lodash";

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
        if (tableCell.hasAttribute("isMetaGroup")) {
          writer.setStyle(
            {
              "background-color": "#cccacab3",
            },
            element
          );
        }

        //model上获取tableCell 上的属性
        const useAttrs = ["type", "optionlist", "isMetaGroup"]
          .map(attrKey => ({
            attrKey,
            value: tableCell.getAttribute(attrKey),
          }))
          .filter(({ attrKey, value }) => value);
        if (useAttrs.length != 0) {
          //获取model上的attrs
          useAttrs.forEach(({ attrKey, value }) => {
            writer.setAttribute(attrKey, value, element);
          });
        }
        //过滤掉data上不需要的属性
        ["class", "role", "contenteditable"].forEach(item => writer.removeAttribute(item, element));

        return element;
      }
    }
  };
}

/** 寻找子元素中 限制编辑元素的 id(marker.name) */
const findRestrictExecptionId = element => {
  if (_.startsWith(element?._id, "restrictedEditingException:")) {
    return element?._id;
  }

  if (element?._children && [...element?._children]?.length > 0) {
    return [...element?._children].map(child => findRestrictExecptionId(child)).filter(res => res);
  }
  return null;
};

/** Table Cell editingDowncast逻辑重写 */
/**
 * @param {Object} [options]
 * @param {Boolean} [options.asWidget]
 * @returns {Function}
 */
export function converEditinghDowncastCell(options = { asWidget: true }) {
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
        //model上获取tableCell 上的属性
        const useAttrs = ["type", "optionlist", "ismetagroup"]
          .map(attrKey => ({
            attrKey,
            value: tableCell.getAttribute(attrKey),
          }))
          .filter(({ attrKey, value }) => value);

        if (useAttrs.length != 0) {
          //获取model上的attrs
          useAttrs.forEach(({ attrKey, value }) => {
            writer.setAttribute(attrKey, value, element);
          });
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
  return [...ele.getClassNames()].includes(EditorClasses.EDITABLE_CLASS);
};

/** 当前点击的元素是否为TableSelect */
export const isCellHasTableSelect = (ele: AttributeElement): boolean => {
  return ele.findAncestor({ name: "td" })?.getAttribute("type") === "select";
};

/** 创建Table-Select Struct */
export const createTableSelect = (writer: Writer, options?: Option[]) => {
  /**最外层容器 */
  const selectContainer = writer.createElement(V_DIV_CONTAINER, {
    class: V_SELECT,
    "data-cke-ignore-events": true,
  });

  /**
   * =================================
   */

  /**下拉框*/
  const dropDown = writer.createElement(V_DIV, {
    class: V_SELECT_DROPDOWN,
    "data-cke-ignore-events": true,
  });
  /**下拉框文字 */
  const dropDown_text = writer.createElement(V_DIV, {
    class: V_SELECT_DROPDOWN_TEXT,
    id: V_SELECT_DROPDOWN_TEXT,
    contenteditable: true,
  });
  /**图标 */
  const dorpDown_icon = writer.createElement(V_SPAN, {
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
  const optionList = writer.createElement(V_DIV, { class: V_SELECT_OPTION_LIST });
  (options || []).forEach(({ label, value }) => {
    const optionItem = writer.createElement(V_DIV, {
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

  // bindSelectListener(dropdown_text);
};

/** TableSelect Handler */
export const onTableSelect = e => {
  const clickDom = document.elementFromPoint(e.clientX, e.clientY);
  const flag = isTableSelect(clickDom);
  if (flag) {
    handleSelectEvent(clickDom);
  }
};

/** SelectEvent 集合 */

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
    const dropdown_text = document.getElementById(V_SELECT_DROPDOWN_TEXT);
    dropdown_text.innerText = target.getAttribute(DATA_VALUE);
    emitter.emit(REPLACE_HIDDEN_ITEM_TEXT, target.getAttribute(DATA_VALUE));
  }
  /** 绑定Select的监听器*/
  static bindSelectListener(dropdownText: HTMLDOM) {
    if (!dropdownText) return;

    /** Select ContentEditable 的onChange 和 Select 的搜索功能*/
    dropdownText.addEventListener("input", e => {
      const target: any = e.target;
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

//  ============================================================================================================================

const toTableWidget = (viewElement, writer) => {
  writer.setCustomProperty("table", true, viewElement);

  return toWidget(viewElement, writer, { hasSelectionHandle: true });
};
/** cover Table 转换逻辑 */

export const downcastTable = (tableUtils, options = {} as any) => {
  return (table, { writer }) => {
    console.log(666666);
    const headingRows = table.getAttribute("headingRows") || 0;
    const tableSections = [];

    if (headingRows > 0) {
      tableSections.push(
        writer.createContainerElement(
          "thead",
          null,
          writer.createSlot(
            element => element.is("element", "tableRow") && element.index < headingRows
          )
        )
      );
    }

    if (headingRows < tableUtils.getRows(table)) {
      tableSections.push(
        writer.createContainerElement(
          "tbody",
          null,
          writer.createSlot(
            element => element.is("element", "tableRow") && element.index >= headingRows
          )
        )
      );
    }

    const figureElement = writer.createContainerElement("figure", { class: "table" }, [
      writer.createContainerElement("table", null, tableSections),
      writer.createSlot(element => !element.is("element", "tableRow")),
    ]);
    // const wrapperFigureElement = createTableWrapper(writer, figureElement, {
    //   tableCols: tableUtils.getColumns(table),
    //   tableRows: tableUtils.getRows(table),
    // });
    //给figure 包裹 锚点Wrapper

    return options.asWidget ? toTableWidget(figureElement, writer) : figureElement;
  };
};

/** 创建Table 锚点Wrapper */
const createTableWrapper = (writer: DowncastWriter, figureEle, { tableRows, tableCols }) => {
  console.log("KKKKKKKKKKKKKKKKKKKKK");
  //创建 行锚点
  const rowItemCollection = [] as any;
  for (let i = 0; i < tableCols; i++) {
    rowItemCollection.push(writer.createUIElement("div", { class: "wrapper-row-item" }));
  }
  const wrapperRow = writer.createContainerElement(
    "div",
    {
      class: "wrapper-row",
    },
    rowItemCollection
  );
  //创建 纵向锚点
  const colItemCollection = [] as any;

  console.log(
    "%c🍉Lee%cline:398%ctableRows",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(39, 72, 98);padding:3px;border-radius:2px",
    tableRows
  );
  const trDomList = document.getElementsByClassName("table")[0];

  console.log(
    "%c🍉Lee%cline:407%ctrDomList",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(38, 157, 128);padding:3px;border-radius:2px",
    trDomList
  );
  for (let i = 0; i < tableRows; i++) {
    colItemCollection.push(writer.createUIElement("div", { class: "wrapper-col-item" }));
  }

  //获取tableCell的列数，然后创建对应的 锚点行
  const wrapperCol = writer.createContainerElement(
    "div",
    { class: "wrapper-col" },
    colItemCollection
  );

  console.log(
    "%cMyProject%cline:376%cfigureEle",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(96, 143, 159);padding:3px;border-radius:2px",
    figureEle
  );
  const anchorTableWrapper = writer.createContainerElement("div", { class: "table-wrapper" }, [
    wrapperRow,
    wrapperCol,
    figureEle,
  ] as any);
  return anchorTableWrapper;
};
