import { Extension } from "@tiptap/core";

const INDENT_LEVELS = [0, 1, 2, 3, 4, 5, 6];
const INDENT_PX = 24; // px per level

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create({
  name: "indent",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (el) => {
              const ml = parseInt(el.style.marginLeft || "0", 10);
              return Math.round(ml / INDENT_PX);
            },
            renderHTML: ({ indent }) =>
              indent > 0
                ? { style: `margin-left: ${indent * INDENT_PX}px` }
                : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;
          let changed = false;

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!["paragraph", "heading", "blockquote"].includes(node.type.name)) return;
            const current = node.attrs.indent ?? 0;
            const next = Math.min(INDENT_LEVELS[INDENT_LEVELS.length - 1], current + 1);
            if (next !== current) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
              changed = true;
            }
          });

          if (changed && dispatch) dispatch(tr);
          return changed;
        },

      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;
          let changed = false;

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!["paragraph", "heading", "blockquote"].includes(node.type.name)) return;
            const current = node.attrs.indent ?? 0;
            const next = Math.max(0, current - 1);
            if (next !== current) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
              changed = true;
            }
          });

          if (changed && dispatch) dispatch(tr);
          return changed;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // Only indent paragraphs/headings when not in a list
        const { state } = this.editor;
        const { $from } = state.selection;
        const parentType = $from.parent.type.name;
        if (["paragraph", "heading"].includes(parentType)) {
          return this.editor.commands.indent();
        }
        return false;
      },
      "Shift-Tab": () => {
        const { state } = this.editor;
        const { $from } = state.selection;
        const parentType = $from.parent.type.name;
        if (["paragraph", "heading"].includes(parentType)) {
          return this.editor.commands.outdent();
        }
        return false;
      },
    };
  },
});
