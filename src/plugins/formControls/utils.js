/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Matcher } from "ckeditor5/src/engine";

/**
 * @module restricted-editing/restrictededitingmode/utils
 */

/**
 * Returns a single "restricted-editing-exception" marker at a given position. Contrary to
 * {@link module:engine/model/markercollection~MarkerCollection#getMarkersAtPosition}, it returnd a marker also when the postion is
 * equal to one of the marker's start or end positions.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {module:engine/model/position~Position} position
 * @returns {module:engine/model/markercollection~Marker|undefined} marker
 */
export function getMarkerAtPosition(editor, position) {
  console.log(editor.model.markers);
  for (const marker of editor.model.markers) {
    const markerRange = marker.getRange();
    console.log(markerRange, position, marker);
    if (isPositionInRangeBoundaries(markerRange, position)) {
      if (marker.name.startsWith("restrictedEditingException:") || marker.name.startsWith("controlSelect:")) {
        console.log(marker);
        return marker;
      }
    }
  }
}

/**
 * Checks if the position is fully contained in the range. Positions equal to range start or end are considered "in".
 *
 * @param {module:engine/model/range~Range} range
 * @param {module:engine/model/position~Position} position
 * @returns {Boolean}
 */
export function isPositionInRangeBoundaries(range, position) {
  console.log(range.containsPosition(position));
  console.log(range.end.isEqual(position));
  console.log(range.start.isEqual(position));

  return range.containsPosition(position) || range.end.isEqual(position) || range.start.isEqual(position);
}

/**
 * Checks if the selection is fully contained in the marker. Positions on marker boundaries are considered "in".
 *
 *		<marker>[]foo</marker> -> true
 *		<marker>f[oo]</marker> -> true
 *		<marker>f[oo</marker> ba]r -> false
 *		<marker>foo</marker> []bar -> false
 *
 * @param {module:engine/model/selection~Selection} selection
 * @param {module:engine/model/markercollection~Marker} marker
 * @returns {Boolean}
 */
export function isSelectionInMarker(selection, marker) {
  if (!marker) {
    return false;
  }

  const markerRange = marker.getRange();

  if (selection.isCollapsed) {
    return isPositionInRangeBoundaries(markerRange, selection.focus);
  }

  return markerRange.containsRange(selection.getFirstRange(), true);
}

export function upcastHighlightToMarker(config) {
  console.log("上传助手");
  return dispatcher =>
    dispatcher.on("element:control-select", (evt, data, conversionApi) => {
      console.log(
        "%c🍉Lee%cline:80%cdisPatcher",
        "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
        "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
        "color:#fff;background:rgb(114, 83, 52);padding:3px;border-radius:2px",
        "disPatcher"
      );
      const { writer } = conversionApi;

      const matcher = new Matcher(config.view);
      console.log("view🍉：", config.view, "viewItem🤔:", data.viewItem);
      const matcherResult = matcher.match(data.viewItem);

      console.log(
        "%c🍉Lee%cline:91%cmathcerResult",
        "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
        "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
        "color:#fff;background:rgb(3, 101, 100);padding:3px;border-radius:2px",
        matcherResult
      );
      // If there is no match, this callback should not do anything.
      if (!matcherResult) {
        return;
      }

      const match = matcherResult.match;

      // Force consuming element's name (taken from upcast helpers elementToElement converter).
      match.name = true;

      const { modelRange: convertedChildrenRange } = conversionApi.convertChildren(data.viewItem, data.modelCursor);
      conversionApi.consumable.consume(data.viewItem, match);

      const markerName = config.model(data.viewItem);
      const fakeMarkerStart = writer.createElement("$marker", { "data-name": markerName });
      const fakeMarkerEnd = writer.createElement("$marker", { "data-name": markerName });

      // Insert in reverse order to use converter content positions directly (without recalculating).
      writer.insert(fakeMarkerEnd, convertedChildrenRange.end);
      writer.insert(fakeMarkerStart, convertedChildrenRange.start);

      data.modelRange = writer.createRange(writer.createPositionBefore(fakeMarkerStart), writer.createPositionAfter(fakeMarkerEnd));
      data.modelCursor = data.modelRange.end;
    });
}
