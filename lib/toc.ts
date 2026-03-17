export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Adds `id` attributes to h2/h3 tags in raw HTML string */
export function addHeadingIds(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(/<(h[23])([^>]*)>(.*?)<\/h[23]>/gi, (_, tag, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "");
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
}

/** Extracts headings from HTML that already has id attributes */
export function extractHeadings(html: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const regex = /<(h[23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1][1]) as 2 | 3;
    const id = match[2];
    const text = match[3].replace(/<[^>]+>/g, "");
    headings.push({ id, text, level });
  }
  return headings;
}
