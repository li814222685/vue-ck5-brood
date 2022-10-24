/**
 * @description Commands
 */

import Command from "@ckeditor/ckeditor5-core/src/command";

export class InsertSimpleBoxCommand extends Command {
  execute(range) {
    console.log("执行了");
    return this.editor.model.change(writer => {
      // Insert <simpleBox>*</simpleBox> at the current selection position
      // in a way that will result in creating a valid model structure.
      return this.editor.model.insertObject(createSimpleBox(writer), range);
    });
    // this.editor.conversion.elementToElement({
    //   model: "simpleBox",
    //   view: "form",
    //   converterPriority: "high",
    // });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "simpleBox");

    this.isEnabled = allowedIn !== null;
  }
}
export function createSimpleBox(writer) {
  console.log(
    "%c🍉Lee%cline:30%c创建创建",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(227, 160, 93);padding:3px;border-radius:2px",
    "创建创建"
  );
  const simpleBox = writer.createElement("simpleBox"); // => span
  const simpleBoxTitle = writer.createElement("simpleBoxTitle"); // => select
  const simpleBoxDescription = writer.createElement("simpleBoxDescription"); // => option
  const simpleBoxDescriptions = writer.createElement("simpleBoxDescriptions");
  // const aa = writer.createElement( 'aa' );

  writer.append(simpleBoxTitle, simpleBox);
  writer.append(simpleBoxDescription, simpleBoxTitle);
  writer.append(simpleBoxDescriptions, simpleBoxTitle);
  // writer.append( aa, simpleBox );
  // horizontalLine
  // const par = writer.createElement( 'horizontalLine' );
  // writer.insert( par, simpleBoxTitle, 1 );
  // There must be at least one paragraph for the description to be editable.
  // See https://github.com/ckeditor/ckeditor5/issues/1464.
  // writer.appendElement("paragraph", simpleBoxDescriptions);
  return simpleBox;
}

export function createSpan(writer) {
  const simpleBox = writer.createElement("simpleSpan"); // => span

  // const aa = writer.createElement( 'aa' );

  // writer.append( aa, simpleBox );
  // horizontalLine
  // const par = writer.createElement( 'horizontalLine' );
  // writer.insert( par, simpleBoxTitle, 1 );
  // There must be at least one paragraph for the description to be editable.
  // See https://github.com/ckeditor/ckeditor5/issues/1464.
  // writer.appendElement("paragraph", simpleBoxDescriptions);
  return simpleBox;
}

export default {
  InsertSimpleBoxCommand,
  createSimpleBox,
  createSpan,
};
