/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// A helper function that retrieves and concatenates all text within the model range.
export default function getRangeText( range ) {
	return Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		if ( !( node.is( 'text' ) || node.is( 'textProxy' ) ) ) {
			return rangeText;
		}

		return rangeText + node.data;
	}, '' );
}
/**
 * Returns `true` if a given view node is the link element.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
 export function isLinkElement( node ) {
  // if(node.is( 'editableElement' )){
  //   if(node.name =='section'){
      
  //     console.log('edit')
  //     return  true;
  //   }
// }
return node.is( 'editableElement' ) && node.name =='section'
// console.log(node)
// console.log(node.name)
// if(node.getClassNames('section')){
//   console.log(321)
// }
//   if(node.is('EditableElement')){
//     console.log(112)
//   }else{
//     console.log(211)
//   }
  
	// return node.is( 'attributeElement' ) && !!node.getCustomProperty( 'title' );
	// return node.is('element') && !!node.getClassNames('section');
}