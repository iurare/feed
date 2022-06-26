import { parseItem } from "./item.ts";
import { FeedItem } from "../types.ts";

export async function parseFeedItems(arrayItems: FeedItem[]): Promise<FeedItem[]> {
  const parsedItems: FeedItem[] = [];

  if (arrayItems) {
    for (const item of arrayItems) {
      const parsedItem = await parseItem(item);

      if (parsedItem) {
        parsedItems.push(parsedItem);
      }
    }
  }

  return parsedItems;
}
