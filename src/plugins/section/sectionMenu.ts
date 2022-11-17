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
      { key: "currentcase", value: sectionDom.getAttribute("currentcase") },
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
export function changeCaseValue(caseName: string, currentCase: string, casesList: any, vueObject: any) {
  const editor = (window as any).editor;
  const { model } = editor;
  const modelSelection = model.document.selection;
  // const casesList = {
  //   caseA: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" currentcase="caseA" contenteditable="true"><p>我只是一个段落</p><span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方A</span></section>`,
  //   caseB: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" currentcase="caseB" contenteditable="true"><p><span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方B</span>我只是一个段落B</p><p>我只是一个段落B<span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方B</span></p></section>`,
  //   caseC: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" currentcase="caseC" contenteditable="true"><p>我只是一个段落C</p><span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方C</span></section>`,
  //   caseD: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" currentcase="caseD" contenteditable="true"><p>我只是一个段落D</p></section>`,
  // };
  // 获取html标签字符串转换的对象
  const newParserSection = changeObject(_.clone(parse(casesList[caseName])));
  model.change(writer => {
    // 获取section范围
    const elementRange = writer.createRange(modelSelection.getFirstPosition(), modelSelection.getLastPosition());
    // 通过section 范围获取到范围内的 element
    let element = model.schema.getLimitElement(elementRange);
    if (element.name == "$root") {
      // 获取根节点时根据光标获取光标所在元素，再找到section
      const parent = modelSelection.getFirstPosition().parent;
      if (parent.previousSibling && parent.previousSibling.name == "v-section" && parent.previousSibling.getAttribute("currentcase") == currentCase) {
        element = parent.previousSibling;
      } else if (parent.nextSibling && parent.nextSibling.name == "v-section" && parent.nextSibling.getAttribute("currentcase") == currentCase) {
        element = parent.nextSibling;
      }
    }
    const range = writer.createRangeOn(element);
    // 删除移除范围内的所有marker
    Array.from(model.markers.getMarkersIntersectingRange(range)).map(marker => writer.removeMarker((marker as any).name));
    // 移除范围和范围内元素，再去插入
    writer.remove(range);
    // 创建新的element，插入
    const newElement = createSectionInner({
      writer: writer,
      parseDom: newParserSection,
      parentElement: null,
      vueObject: vueObject,
    });
    model.insertObject(newElement, range);
  });
}

/**
 * @description 修改section中span的结构
 * @param list 元素结构转化的对象
 */
function changeObject(list: any[]) {
  const newList = list.map(item => {
    // 判断如果是可编辑的span 改变span的type 将span的children的文字内容合并，改为span的content，方便递归生成元素时的操作
    if (item.tagName === "span" && Object.fromEntries([...item.attributes.map(item => [item.key, item.value])]).class.includes("restricted-editing-exception")) {
      item.content = item.children.map(i => i.content).join("");
      item.type = "text";
      delete item.children;
    }
    // 递归
    if (item.children && item.tagName != "span") {
      changeObject(item.children);
    }
    return item;
  });
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
  let dom: any = null,
    beforePosition: any = null,
    afterPosition: any = null;
  for (let item of parseDom) {
    dom = "";
    // 当时span元素外的元素时创建元素
    if (item.type === "element" && item.tagName !== "span") {
      // 返回元素属性对象
      const atttibutesList = Object.fromEntries([...item.attributes.map(item => [item.key, item.value])]);
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
      // span和非元素类
    } else if (parentElement) {
      // 创建文字元素
      let text = writer.createText(item.content);
      writer.append(text, parentElement);
      let range = null;
      // span元素的不同位置
      if (item.tagName && item.tagName === "span") {
        /**
         * 当使用模型编写器更改模型并且文本节点与另一个文本节点合并时，
         * 会发生Text实例可能会间接从模型树中删除然后，将删除两个文本节点，
         * 并将一个新的文本节点插入到模型中。
         * 由于这种行为，不建议保留对文本的引用。
         * 相反，考虑在文本节点之前创建位置。
         * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_text-Text.html
         */
        // 当span不是第一个text元素时 , 或者单独一行时
        if ((!text.parent && beforePosition) || !beforePosition) {
          // 创建span前面的位置
          beforePosition = !beforePosition ? writer.createPositionBefore(text) : beforePosition;
          // 创建span后面的位置
          afterPosition = _.clone(beforePosition);
          afterPosition.path = afterPosition.path.length < 2 ? [beforePosition.path[0] + text.offsetSize] : [beforePosition.path[0], beforePosition.path[1] + text.offsetSize];
          // 生成span的位置，供添加marker使用
          range = writer.createRange(beforePosition, afterPosition);
        } else {
          // 当span是第一个text元素且不是单独一行时创建范围
          range = writer.createRangeOn(text);
        }
        // 添加marker
        vueObject.$nextTick(() => {
          setMarker(range);
        });
      } else {
        // 如果不是span元素的话，创建text的后面的位置作为span前面的位置
        beforePosition = !beforePosition ? writer.createPositionAfter(text) : beforePosition;
      }
    }
    // 递归
    if (item.children) {
      createSectionInner({
        writer: writer,
        parseDom: item.children,
        parentElement: dom,
        vueObject: vueObject,
      });
    }
  }
  return dom;
}
