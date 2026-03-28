import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutType = "info" | "warning" | "tip" | "danger";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (calloutType: CalloutType) => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      calloutType: {
        default: "info" as CalloutType,
        parseHTML: (el) => el.getAttribute("data-callout-type") ?? "info",
        renderHTML: ({ calloutType }) => ({ "data-callout-type": calloutType }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-callout": "" }, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (calloutType: CalloutType) =>
        ({ commands }) =>
          commands.wrapIn(this.name, { calloutType }),
    };
  },
});
