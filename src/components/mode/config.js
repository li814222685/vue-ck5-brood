import FormControls from "@/plugins/formControls/formControls";
import ControlsMenu from "@/plugins/controlsMenu/controlsMenu";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Link from "@ckeditor/ckeditor5-link/src/link";
import RestrictedEditingMode from "@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode";
import StandardEditingMode from "@ckeditor/ckeditor5-restricted-editing/src/standardeditingmode";

export const RESTRICT_CONFIG = {
  plugins: [Heading, Essentials, Bold, Italic, Paragraph, Link, RestrictedEditingMode, FormControls],
  restrictedEditing: {
    allowedCommands: ["bold", "simpleBox", "heading", "insertSimpleBox"],
    allowedAttributes: ["bold", "simpleBox", "heading", "class"],
  },
  toolbar: ["heading", "|", "bold", "italic", "link", "numberedList", "bulletedList", "|", "abbreviation", "abbreviations", "bubble", "simpleBox", "restrictedEditing"],
};

export const NORMAL_CONFIG = {
  plugins: [Heading, Essentials, Bold, Italic, Paragraph, Link, StandardEditingMode, ControlsMenu],

  toolbar: ["heading", "|", "bold", "italic", "link", "numberedList", "bulletedList", "|", "abbreviation", "abbreviations", "bubble", "controlsMenu", "restrictedEditingException"],
};
