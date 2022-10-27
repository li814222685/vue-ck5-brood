/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/blockquotecommand
 */

// import { Command } from 'ckeditor5/src/core';
import Command from '@ckeditor/ckeditor5-core/src/command';
// import { first } from 'ckeditor5/src/utils';
import { first } from '@ckeditor/ckeditor5-utils';
// import {Section} from "../service"


/**
 * The block quote command plugin.
 *
 * @extends module:core/command~Command
 */
export default class BlockQuoteCommand extends Command {
	/**
	 * Whether the selection starts in a block quote.
	 *
	 * @observable
	 * @readonly
	 * @member {Boolean} #value
	 */

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command. When the command {@link #value is on}, all top-most block quotes within
	 * the selection will be removed. If it is off, all selected blocks will be wrapped with
	 * a block quote.
	 *
	 * @fires execute
	 * @param {Object} [options] Command options.
	 * @param {Boolean} [options.forceValue] If set, it will force the command behavior. If `true`, the command will apply a block quote,
	 * otherwise the command will remove the block quote. If not set, the command will act basing on its current value.
	 */
	execute( options = {} ) {
    console.log(options)
    console.log(this.editor)
		const model = this.editor.model;
		const editing = this.editor.editing;
		const schema = model.schema;
		const selection = model.document.selection;
		const blocks = Array.from( selection.getSelectedBlocks() );
    console.log(selection.getSelectedBlocks())
    const firstRange = selection.getFirstPosition()
    const LastRange = selection.getLastPosition()
    console.log(this.value)
    console.log(options.forceValue === undefined)
		const value = ( options.forceValue === undefined ) ? !this.value : options.forceValue;
    model.change( writer => {
      if ( !value ) {
        console.log(1)
        if(options == 'submit'){
          // writer.insert(window.elem,window.markerprant,'end')
          // console.log(Array.from(window.ran.getPositions()))
          // console.log(window.ran.getContainedElement())
          writer.setAttribute('aaa','cs',window.elem )
          // writer.insertText( 'foo', { bold: true }, window.elem );
          // writer.insertText( 'foosss', { bold: true }, window.elem );
          // writer.insertText( 'fooaaa', { bold: true }, window.elem );
          // writer.insert(window.elss,window.ran,'end')
          // let quo = writer.createElement( 'sectionis' );
          // writer.wrap( window.ran, window.elss );
        }else if(options == 'cancel'){
          writer.remove(window.markerprant)
          let ran = writer.createRangeOn(window.elem)
          console.log(ran)
          window.ran = ran
        }else{
          this._removeQuote( writer, blocks.filter( findQuote ) );
        }
      } else {
        console.log(2)
        console.log(blocks)
        const blocksToQuote = blocks.filter( block => {
          // Already quoted blocks needs to be considered while quoting too
          // in order to reuse their <bQ> elements.
          return findQuote( block ) || checkCanBeQuoted( schema, block );
        } );
        console.log(blocksToQuote)
        console.log(writer)
        const range = writer.createRange( firstRange, LastRange );
        console.log(range)
        this._applyQuote( writer, blocksToQuote ,range);
      }
    } );
    editing.view.change( writer => {
      if(options == 'submit'){
        console.log(writer)
        console.log(window.elem)
        writer.setAttribute('cs','cs',window.elem)
        // writer.addClass('cccs',window.elem)
        // let marker = editing.mapper.markerNameToElements(window.Section)
        console.log(writer)
      }
    })
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {Boolean} The current value.
	 */
	_getValue() {
		const selection = this.editor.model.document.selection;

    console.log(selection.getSelectedBlocks())
		const firstBlock = first( selection.getSelectedBlocks() );
    console.log(firstBlock)

		// In the current implementation, the block quote must be an immediate parent of a block element.
		return !!( firstBlock && findQuote( firstBlock ) );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		if ( this.value ) {
			return true;
		}

		const selection = this.editor.model.document.selection;
		const schema = this.editor.model.schema;

		const firstBlock = first( selection.getSelectedBlocks() );

		if ( !firstBlock ) {
			return false;
		}
		return checkCanBeQuoted( schema, firstBlock );
	}

	/**
	 * Removes the quote from given blocks.
	 *
	 * If blocks which are supposed to be "unquoted" are in the middle of a quote,
	 * start it or end it, then the quote will be split (if needed) and the blocks
	 * will be moved out of it, so other quoted blocks remained quoted.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @param {Array.<module:engine/model/element~Element>} blocks
	 */
	_removeQuote( writer, blocks ) {
		// Unquote all groups of block. Iterate in the reverse order to not break following ranges.
		getRangesOfBlockGroups( writer, blocks ).reverse().forEach( groupRange => {
			if ( groupRange.start.isAtStart && groupRange.end.isAtEnd ) {
				writer.unwrap( groupRange.start.parent );

				return;
			}

			// The group of blocks are at the beginning of an <bQ> so let's move them left (out of the <bQ>).
			if ( groupRange.start.isAtStart ) {
				const positionBefore = writer.createPositionBefore( groupRange.start.parent );

				writer.move( groupRange, positionBefore );

				return;
			}

			// The blocks are in the middle of an <bQ> so we need to split the <bQ> after the last block
			// so we move the items there.
			if ( !groupRange.end.isAtEnd ) {
				writer.split( groupRange.end );
			}

			// Now we are sure that groupRange.end.isAtEnd is true, so let's move the blocks right.

			const positionAfter = writer.createPositionAfter( groupRange.end.parent );

			writer.move( groupRange, positionAfter );
		} );
	}

	/**
	 * Applies the quote to given blocks.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @param {Array.<module:engine/model/element~Element>} blocks
	 */
	_applyQuote( writer, blocks ,range) {
		const quotesToMerge = [];
		// Quote all groups of block. Iterate in the reverse order to not break following ranges.
    // 引用所有区块组。按相反的顺序循环，以不打破以下范围。
		getRangesOfBlockGroups( writer, blocks ).reverse().forEach( (groupRange,index,arr) => {
      console.log(groupRange)
      window.groupRange = groupRange

      console.log(arr)
			let quote = findQuote( groupRange.start );
      console.log(quote)
			if ( !quote ) {
        console.log(11)
				quote = writer.createElement( 'section' );
        console.log(quote)
        // console.log(window.Section)
        // console.log(Section.SECTION1)
        writer.addMarker( 'window.Section', { range, usingOperation: true } );
        writer.setAttributes({class:'cs'},range)
				writer.wrap( groupRange, quote );
			}
      let marker = this.editor.model.markers.get('window.Section')
      console.log(marker)
      const markerprant = marker.getRange()
      window.markerprant = markerprant
      console.log(markerprant)
      const prantelement = markerprant.getCommonAncestor()
      console.log(prantelement)
      const cloneElement = writer.cloneElement(prantelement,[true])
      console.log(cloneElement)
      window.elem = prantelement
      window.elss = cloneElement
      // const elem = writer.cloneElement(blocks,[true])
			quotesToMerge.push( quote );
			// writer.wrap( groupRange, cloneElement );
		} );

		// Merge subsequent <bQ> elements. Reverse the order again because this time we want to go through
		// the <bQ> elements in the source order (due to how merge works – it moves the right element's content
		// to the first element and removes the right one. Since we may need to merge a couple of subsequent `<bQ>` elements
		// we want to keep the reference to the first (furthest left) one.
    //合并后续＜bQ＞元素。再次颠倒顺序，因为这次我们要通过
    //源顺序中的&lt；bQ&gt；元素（由于合并的工作方式，它移动了正确元素的内容
    //并删除右元素。因为我们可能需要合并几个后续的`<bQ>`元素
    //我们希望保持对第一个（最左边）的引用。
    console.log(quotesToMerge)
		quotesToMerge.reverse().reduce( ( currentQuote, nextQuote ) => {
      console.log(currentQuote)
      console.log(nextQuote)
			if ( currentQuote.nextSibling == nextQuote ) {
        console.log(22)

				writer.merge( writer.createPositionAfter( currentQuote ) );

				return currentQuote;
			}
      console.log(33)
			return nextQuote;
		} );
	}
}

function findQuote( elementOrPosition ) {
  console.log(elementOrPosition)
	return elementOrPosition.parent.name == 'section' ? elementOrPosition.parent : null;
}

// Returns a minimal array of ranges containing groups of subsequent blocks.
//
// content:         abcdefgh
// blocks:          [ a, b, d, f, g, h ]
// output ranges:   [ab]c[d]e[fgh]
//
// @param {Array.<module:engine/model/element~Element>} blocks
// @returns {Array.<module:engine/model/range~Range>}
function getRangesOfBlockGroups( writer, blocks ) {
  console.log(writer)
  console.log(blocks)
	let startPosition;
	let i = 0;
	const ranges = [];

	while ( i < blocks.length ) {
		const block = blocks[ i ];
		const nextBlock = blocks[ i + 1 ];

		if ( !startPosition ) {
			startPosition = writer.createPositionBefore( block );
		}

		if ( !nextBlock || block.nextSibling != nextBlock ) {
			ranges.push( writer.createRange( startPosition, writer.createPositionAfter( block ) ) );
			startPosition = null;
		}

		i++;
	}
	return ranges;
}

// Checks whether <bQ> can wrap the block.
function checkCanBeQuoted( schema, block ) {
	// TMP will be replaced with schema.checkWrap().
	const isBQAllowed = schema.checkChild( block.parent, 'section' );
	const isBlockAllowedInBQ = schema.checkChild( [ '$root', 'section' ], block );
	return isBQAllowed && isBlockAllowedInBQ;
}
