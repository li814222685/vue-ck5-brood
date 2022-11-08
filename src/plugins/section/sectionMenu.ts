/**
 * @description restrict model section menu
 */
import { toRaw } from "vue";
import { parse, stringify } from "himalaya";
import { V_SECTION } from "./constant";

export function getDomPath(ele) {
  let path = ele.nodeName;
  let parent = ele.parentNode;
  while (parent) {
    path = parent.nodeName + "/" + path;
    parent = parent.parentNode;
  }
  return path;
}
//Section Menu展示逻辑
export function toShowSectionMenu(clickDom, vueObject) {
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
 * @param val caseName
 */
export function changeCaseValue(caseName, vueObject) {
  const editor = (window as any).editor;
  const { model, editing } = editor;
  const view = editing.view;
  const modelSelection = model.document.selection;
  const casesList = {
    caseA: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" contenteditable="true"><p>我只是一个段落</p><span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方</span></section>`,
    caseB: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" contenteditable="true"><p>我只是一个段落B</p></section>`,
    caseC: `<section class="ck-editor__editable ck-editor__nested-editable" modelname="模块名" type="switch" data-cases="["caseA","caseB","caseC", "caseD"]" role="textbox" contenteditable="true"><span class="restricted-editing-exception restricted-editing-exception_collapsed">只是一个可编辑的地方</span></section>`,
  };
  const sectionVal = casesList[caseName];
  // 获取html标签字符串转换的对象
  const parserSection = parse(sectionVal);
  let range = null;
  const firstRange = modelSelection.getFirstPosition();
  const LastRange = modelSelection.getLastPosition();
  const markers = model.markers;
  model.change(writer => {
    // 获取section范围
    // 通过section 范围获取到范围内的 element
    const elementRange = writer.createRange(firstRange, LastRange);
    const element = model.schema.getLimitElement(elementRange);
    const finition = model.schema.getDefinitions();
    range = writer.createRangeOn(element);
    console.log(range, finition, "range");
    const markerList = Array.from(markers.getMarkersIntersectingRange(range));
    // 删除移除范围内的所有marker
    markerList.map(marker => writer.removeMarker((marker as any).name));
    // 移除范围和范围内元素，再去插入
    writer.remove(range);
    // 创建新的element，插入
    const params = {
      writer: writer,
      parserDom: parserSection,
      parentElement: null,
      vueObject: vueObject,
    };
    const newElement = createSectionInner(params);
    model.insertContent(newElement, range);
  });
}

/**
 * @description 创建section内的元素
 * @param writer model 编写器
 * @param parserDom 元素结构转化的对象
 * @param parentElement 父级元素
 */
function createSectionInner(params) {
  const { writer, parserDom, parentElement, vueObject } = params;
  let elementList = [],
    text = null,
    dom = null;
  for (let item of parserDom) {
    text = "";
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
    } else {
      // span 和元素內的文字需要创建文字插入到dom中
      if (item.tagName && item.tagName === "span") {
        for (let i of item.children) {
          text += i.content;
        }
        const word = writer.createText(text);
        // console.log(parentElement);
        writer.append(word, parentElement);
        vueObject.$nextTick(() => {
          const range = writer.createRangeOn(word);
          console.log(word, range);
          vueObject.spanRanges = range;
          const { model } = (window as any).editor;
          model.change(writer => {
            const ranges = toRaw(vueObject.spanRanges);
            // 添加可编辑的 marker，进行 markertohighlight 的下行转换
            const markers = Array.from(model.markers);
            const lastMarkerName = Number((markers as any)[markers.length - 1].name.split(":")[1]);
            const markerName = `restrictedEditingException:` + (lastMarkerName + 1);
            writer.addMarker(markerName, { range: ranges, usingOperation: true });
          });
        });
      } else if (parentElement) {
        const word = writer.createText(item.content);
        writer.append(word, parentElement);
      }
    }
    // 递归
    if (item.children) {
      const params = {
        writer: writer,
        parserDom: item.children,
        parentElement: dom,
        vueObject: vueObject,
      };
      createSectionInner(params);
    }
  }
  return dom;
}
