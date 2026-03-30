import { Node, mergeAttributes } from "@tiptap/core";

function getVimeoId(url: string): string | null {
  const match = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  return match?.[1] ?? null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    vimeo: {
      setVimeoVideo: (src: string) => ReturnType;
    };
  }
}

export const Vimeo = Node.create({
  name: "vimeo",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-vimeo-video]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const id = getVimeoId(HTMLAttributes.src ?? "");
    if (!id) return ["div", {}];
    return [
      "div",
      mergeAttributes({ "data-vimeo-video": "" }),
      [
        "iframe",
        {
          src: `https://player.vimeo.com/video/${id}?badge=0&autopause=0`,
          frameborder: "0",
          allowfullscreen: "true",
          allow: "autoplay; fullscreen; picture-in-picture",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVimeoVideo:
        (src: string) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { src } }),
    };
  },
});
