/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";
import { Model } from "@ckeditor/ckeditor5-engine";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import _ from "lodash";
import { V_SECTION } from "./constant";
import { first } from "@ckeditor/ckeditor5-utils";

interface Option {
  label: string | number;
  value: string | number | boolean;
}

/**
 * blocks 获取选定块
 * firstRange 获取selection的开始位置
 * LastRange  获取selection的结束位置
 * range      获取选中selection的range（范围）
 */
export class SectionCommand extends Command {
  execute(options:any = {}) {
    const model = this.editor.model;
    const schema = model.schema;
    const selection = model.document.selection;
    const blocks = Array.from(selection.getSelectedBlocks());
    const firstRange = selection.getFirstPosition();
    const LastRange = selection.getLastPosition();
    const value = options.forceValue === undefined ? !this.value : options.forceValue;
    model.change(writer => {
      if (!value) {
          this._removeQuote(writer, blocks.filter(findQuote));
      } else {
        const blocksToQuote = blocks.filter(block => {
          return findQuote(block) || checkCanBeQuoted(schema, block);
        });
        const range = writer.createRange(firstRange, LastRange);
        this._applyQuote(writer, blocksToQuote, range);
      }
    });
  }

  refresh() {
    this.value = this._getValue();
    this.isEnabled = this._checkEnabled();
  }
  /* value值校验 所选中的块是否包含section  */
  _getValue() {
    const selection = this.editor.model.document.selection;
    const firstBlock = first(selection.getSelectedBlocks());
    return !!(firstBlock && findQuote(firstBlock));
  }
  
  /* 选中的校验 （是否包含section）  */
  _checkEnabled() {
    if (this.value) {
      return true;
    }
    const selection = this.editor.model.document.selection;
    const schema = this.editor.model.schema;
    const firstBlock = first(selection.getSelectedBlocks());
    if (!firstBlock) {
      return false;
    }
    return checkCanBeQuoted(schema, firstBlock);
  }
  /**
   * 
   * @param writer  
   * @param blocks 
   * @effect 选中区域有section属性则取消section
   */
  _removeQuote(writer, blocks) {
    getRangesOfBlockGroups(writer, blocks)
      .reverse()
      .forEach(groupRange => {
        if (groupRange.start.isAtStart && groupRange.end.isAtEnd) {
          writer.unwrap(groupRange.start.parent);
          return;
        }
        if (groupRange.start.isAtStart) {
          const positionBefore = writer.createPositionBefore(groupRange.start.parent);
          writer.move(groupRange, positionBefore);
          return;
        }
        if (!groupRange.end.isAtEnd) {
          writer.split(groupRange.end);
        }
        const positionAfter = writer.createPositionAfter(groupRange.end.parent);
        writer.move(groupRange, positionAfter);
      });
  }
  /**
   * 
   * @param writer 
   * @param blocks  包含的子元素
   * @param range   范围
   */
  _applyQuote(writer, blocks, range) {
    const quotesToMerge = [];
    // Quote all groups of block. Iterate in the reverse order to not break following ranges.
    // 引用所有区块组。按相反的顺序循环，以不打破以下范围。
    getRangesOfBlockGroups(writer, blocks)
      .reverse()
      .forEach((groupRange, index, arr) => {
        (window as any).groupRange = groupRange;
        let quote = findQuote(groupRange.start);
        if (!quote) {
          quote = writer.createElement(V_SECTION);
          const v_section = writer.createElement(V_SECTION); // => section
          // writer.addMarker("set", { range, usingOperation: true } );
          writer.setAttributes({ class: "cs" }, range);
          writer.wrap(groupRange, quote);
        }
        quotesToMerge.push(quote);
      });
    quotesToMerge.reverse().reduce((currentQuote, nextQuote) => {
      if (currentQuote.nextSibling == nextQuote) {
        writer.merge(writer.createPositionAfter(currentQuote));
        return currentQuote;
      }
      return nextQuote;
    });
  }
}
/**
 * 
 * @param elementOrPosition 判断有无section
 * @returns 
 */
function findQuote(elementOrPosition) {
  return elementOrPosition.parent.name == V_SECTION ? elementOrPosition.parent : null;
}
/* 选中是否多个section 多个则合成一个  */
function getRangesOfBlockGroups(writer, blocks) {
  let startPosition;
  let i = 0;
  const ranges = [];
  while (i < blocks.length) {
    const block = blocks[i];
    const nextBlock = blocks[i + 1];
    if (!startPosition) {
      startPosition = writer.createPositionBefore(block);
    }
    if (!nextBlock || block.nextSibling != nextBlock) {
      ranges.push(writer.createRange(startPosition, writer.createPositionAfter(block)));
      startPosition = null;
    }
    i++;
  }
  return ranges;
}
function checkCanBeQuoted(schema, block) {
  // TMP will be replaced with schema.checkWrap().
  const isBQAllowed = schema.checkChild(block.parent, V_SECTION);
  const isBlockAllowedInBQ = schema.checkChild(["$root", V_SECTION], block);
  return isBQAllowed && isBlockAllowedInBQ;
}
export class InsertSectionCommand extends Command {
  execute(options) {
    const model = this.editor.model;

    const select = model.document.selection.getSelectedElement();
    model.change(writer => {
      console.log(writer)
      // writer.remove(select);
      // insertSelect(model, options);
    });
  }
  refresh() {
    this.isEnabled = true;
  }
}
export default {
  SectionCommand,
};
