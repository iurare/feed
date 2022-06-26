export function parseItemTags(tags?: string[]): string[] {
  let itemTags: string[] = [];

  if (tags) {
    if (Array.isArray(tags)) {
      const parsedTags = [];
      for (const tag of tags) {
        if (typeof tag === "string") {
          parsedTags.push(tag);
        }
      }

      itemTags = [...new Set(parsedTags)];
    }
  }

  return itemTags;
}
