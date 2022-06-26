import { Article } from "../../types.ts";

export interface RSSCache {
  feedUrl: string;
  items: Article[];
}
