import FormControls from "@/plugins/formControls/formControls";
import ControlsMenu from "@/plugins/controlsMenu/";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Link from "@ckeditor/ckeditor5-link/src/link";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
import TableProperties from "@ckeditor/ckeditor5-table/src/tableproperties";
import TableCellProperties from "@ckeditor/ckeditor5-table/src/tablecellproperties";
import RestrictedEditingMode from "@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode";
import StandardEditingMode from "@ckeditor/ckeditor5-restricted-editing/src/standardeditingmode";
import SelectToolbar from "../../plugins/controlsMenu/toolbar";
import { WIDGET_TOOLBAR_NAME__MENU } from "../../plugins/controlsMenu/constant";
export const RESTRICT_CONFIG = {
  plugins: [
    Heading,
    Essentials,
    Bold,
    Italic,
    Paragraph,
    Link,
    RestrictedEditingMode,
    FormControls,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
  ],
  restrictedEditing: {
    allowedCommands: ["bold", "simpleBox", "heading", "insertSimpleBox"],
    allowedAttributes: ["bold", "simpleBox", "heading", "class", "control-select", "controlType"],
  },
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "link",
    "numberedList",
    "bulletedList",
    "|",
    "abbreviation",
    "abbreviations",
    "bubble",
    "simpleBox",
    "restrictedEditing",
  ],
};

const customColorPalette = [
  {
    color: "hsl(4, 90%, 58%)",
    label: "Red",
  },
  {
    color: "hsl(340, 82%, 52%)",
    label: "Pink",
  },
  {
    color: "hsl(291, 64%, 42%)",
    label: "Purple",
  },
  {
    color: "hsl(262, 52%, 47%)",
    label: "Deep Purple",
  },
  {
    color: "hsl(231, 48%, 48%)",
    label: "Indigo",
  },
  {
    color: "hsl(207, 90%, 54%)",
    label: "Blue",
  },

  // ...
];

export const NORMAL_CONFIG = {
  plugins: [
    Heading,
    Essentials,
    Bold,
    Italic,
    Paragraph,
    Link,
    StandardEditingMode,
    ControlsMenu,
    SelectToolbar,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    Bold,
  ],

  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "link",
    "numberedList",
    "bulletedList",
    "|",
    "abbreviation",
    "abbreviations",
    "bubble",
    "restrictedEditingException",
    WIDGET_TOOLBAR_NAME__MENU,
    "insertTable",
  ],
  table: {
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableProperties",
      "tableCellProperties",
    ],
    tableProperties: {
      // ...
    },
    tableCellProperties: {
      borderColors: customColorPalette,
      backgroundColors: customColorPalette,
    },
  },
};
