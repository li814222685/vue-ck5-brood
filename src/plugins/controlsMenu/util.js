export function getSelectedImageWidget(selection) {
  const viewElement = selection.getSelectedElement();
  console.log(selection);
  if (viewElement) {
    return viewElement;
  }

  return null;
}
