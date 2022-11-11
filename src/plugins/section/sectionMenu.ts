/**
 * @description restrict model section menu
 */
import { parse } from "himalaya";
import { V_SECTION } from "./constant";
import _ from "lodash";

/**
 * @description 添加marker
 * @param range marker的范围
 */
export function setMarker(range) {
  const { model } = (window as any).editor;
  model.change(writer => {
    // 添加可编辑的 marker，进行 markertohighlight 的下行转换
    const markers = Array.from(model.markers);
    const lastMarkerName = Number((markers as any)[markers.length - 1].name.split(":")[1]);
    const markerName = `restrictedEditingException:` + (lastMarkerName + 1);
    writer.addMarker(markerName, { range: range, usingOperation: true });
  });
}

/**
 * @description Section Menu展示逻辑
 * @param ele dom
 */
export function getDomPath(ele: HTMLElement) {
  let path = ele.nodeName;
  let parent = ele.parentNode;
  while (parent) {
    path = parent.nodeName + "/" + path;
    parent = parent.parentNode;
  }
  return path;
}

/**
 * @description Section Menu展示逻辑
 * @param clickDom 点击的dom
 * @param vueObject vue:this
 */
export function toShowSectionMenu(clickDom: HTMLElement, vueObject: any) {
  const domAncestorsPath = getDomPath(clickDom);
  const tagName = clickDom.tagName;
  const classList = clickDom.classList;
  const isSelected = Array.from(clickDom.classList).includes("visual-select");
  // tagname 是svg/path classname 有section-btn / section-menu
  const isSectionBtn = tagName == "svg" || tagName == "path" || Array.from(classList).includes("section-btn") || Array.from(classList).includes("section-menu");
  const hasSection = domAncestorsPath.split("/").includes("SECTION");
  const sectionDom = document.querySelector(".ck-editor__nested-editable_focused");
  // 清空位置
  vueObject.positionRange = [];
  vueObject.menuVisible = false;
  //todo ：如果是dom祖先里面有SECTION or tagname 是 svg/path classname 有 section-btn/section-menu 那就展示菜单
  if (hasSection || isSectionBtn) {
    vueObject.menuVisible = true;
  } else {
    vueObject.positionRange = [];
    vueObject.menuVisible = false;
  }
  if (sectionDom) {
    vueObject.attributsList = [
      { key: "type", value: sectionDom.getAttribute("type") },
      { key: "data-cases", value: sectionDom.getAttribute("data-cases") },
      { key: "modelname", value: sectionDom.getAttribute("modelname") },
    ];
    const sectionPostion = sectionDom.getBoundingClientRect();
    const [sectionMenuPostionX, sectionMenuPostionY] = [Math.floor(sectionPostion.x), Math.floor(sectionPostion.y)];
    //todo： 根据这个去显示菜单
    vueObject.positionRange = [sectionMenuPostionX, sectionMenuPostionY];
  }
}

/**
 * @description 获取caseName,找到case结构进行section替换
 * @param caseName caseName
 * @param vueObject vue:this
 */
export function changeCaseValue(caseName: string, currentCase: string, vueObject: any) {
  const editor = (window as any).editor;
  const { model, editing } = editor;
  const view = editing.view;
  const modelSelection = model.document.selection;
  const casesList = {
    caseA: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" case="caseA" contenteditable="true"><p>我只是一个段落</p><span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方A</span></section>`,
    caseB: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" case="caseB" contenteditable="true"><p><span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方B</span>我只是一个段落B</p><p>我只是一个段落B<span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方B</span></p></section>`,
    caseC: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" case="caseC" contenteditable="true"><p>我只是一个段落C</p><span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方C</span></section>`,
    caseD: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" case="caseD" contenteditable="true"><p>我只是一个段落D</p></section>`,
  };
  const sectionVal = casesList[caseName];
  // 获取html标签字符串转换的对象
  const parserSection = parse(sectionVal);
  const newParserSection = changeObject(_.clone(parserSection));
  let range = null;
  const firstRange = modelSelection.getFirstPosition();
  const LastRange = modelSelection.getLastPosition();
  const markers = model.markers;
  model.change(writer => {
    // 获取section范围
    const elementRange = writer.createRange(firstRange, LastRange);
    // 通过section 范围获取到范围内的 element
    let element = model.schema.getLimitElement(elementRange);
    if (element.name == "$root") {
      const parent = firstRange.parent;
      const previousSibling = parent.previousSibling;
      const nextSibling = parent.nextSibling;
      if (previousSibling && previousSibling.name == "v-section" && previousSibling.getAttribute("case") == currentCase) {
        element = previousSibling;
      } else if (nextSibling && nextSibling.name == "v-section" && nextSibling.getAttribute("case") == currentCase) {
        element = nextSibling;
      }
    }
    range = writer.createRangeOn(element);
    const markerList = Array.from(markers.getMarkersIntersectingRange(range));
    // 删除移除范围内的所有marker
    markerList.map(marker => writer.removeMarker((marker as any).name));
    // 移除范围和范围内元素，再去插入
    writer.remove(range);
    // 创建新的element，插入
    const params = {
      writer: writer,
      parseDom: newParserSection,
      parentElement: null,
      vueObject: vueObject,
    };
    const newElement = createSectionInner(params);
    model.insertObject(newElement, range);
  });
}

/**
 * @description 修改section中span的结构
 * @param list 元素结构转化的对象
 */
function changeObject(list: any[]) {
  let text = "",
    newList = [],
    object = { content: "", type: "text", tagName: "span" };
  for (let item of list) {
    object = item;
    if (item.tagName == "span") {
      text = "";
      for (let i of item.children) {
        text += i.content;
      }
      object.content = text;
      object.type = "text";
      item = object;
      delete item.children;
    }
    if (item.children && item.tagName != "span") {
      changeObject(item.children);
    }
    newList.push(item);
  }
  return newList;
}

/**
 * @description 创建section内的元素
 * @param params object 包括：
 * @param writer model 编写器
 * @param parseDom 元素结构转化的对象
 * @param parentElement 父级元素
 * @param vueObject vue:this
 */
function createSectionInner(params) {
  const { writer, parseDom, parentElement, vueObject } = params;
  let dom = null,
    beforePosition = null,
    afterPosition = null;
  for (let item of parseDom) {
    dom = "";
    if (item.type === "element" && item.tagName !== "span") {
      // 返回元素属性对象
      let atttibutesList = item.attributes.map(item => [item.key, item.value]);
      atttibutesList = Object.fromEntries([...atttibutesList]);
      // 创建元素
      if (item.tagName === "section") {
        dom = writer.createElement(V_SECTION, atttibutesList);
      } else if (item.tagName === "p") {
        dom = writer.createElement("paragraph", atttibutesList);
      } else {
        dom = writer.createElement(item.tagName, atttibutesList);
      }
      // 插入到父级元素
      if (parentElement) {
        writer.append(dom, parentElement);
      }
    } else if (parentElement) {
      let text = writer.createText(item.content);
      writer.append(text, parentElement);
      let range = null;
      if (item.tagName && item.tagName === "span") {
        if ((!text.parent && beforePosition) || !beforePosition) {
          beforePosition = !beforePosition ? writer.createPositionBefore(text) : beforePosition;
          afterPosition = _.clone(beforePosition);
          afterPosition.path = afterPosition.path.length < 2 ? [beforePosition.path[0] + text.offsetSize] : [beforePosition.path[0], beforePosition.path[1] + text.offsetSize];
          range = writer.createRange(beforePosition, afterPosition);
        } else {
          range = writer.createRangeOn(text);
        }
        vueObject.$nextTick(() => {
          setMarker(range);
        });
      } else {
        beforePosition = !beforePosition ? writer.createPositionAfter(text) : beforePosition;
      }
    }
    // 递归
    if (item.children) {
      const params = {
        writer: writer,
        parseDom: item.children,
        parentElement: dom,
        vueObject: vueObject,
      };
      createSectionInner(params);
    }
  }
  return dom;
}
