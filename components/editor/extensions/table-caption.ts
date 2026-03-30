import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tableCaption: {
      insertTableCaption: () => ReturnType;
    };
  }
}

export const TableCaption = Node.create({
  name: "tableCaption",
  group: "block",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: "p[data-table-caption]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "p",
      mergeAttributes({ "data-table-caption": "", class: "tiptap-table-caption" }, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      insertTableCaption:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, content: [{ type: "text", text: "Table caption" }] }),
    };
  },
});
