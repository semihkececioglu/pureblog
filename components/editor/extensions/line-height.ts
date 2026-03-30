import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create({
  name: "lineHeight",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el) => el.style.lineHeight || null,
            renderHTML: ({ lineHeight }) =>
              lineHeight ? { style: `line-height: ${lineHeight}` } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) =>
          commands.updateAttributes("paragraph", { lineHeight }) ||
          commands.updateAttributes("heading", { lineHeight }),
      unsetLineHeight:
        () =>
        ({ commands }) =>
          commands.resetAttributes("paragraph", "lineHeight") ||
          commands.resetAttributes("heading", "lineHeight"),
    };
  },
});
