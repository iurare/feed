import { FeedItem } from "./utils/parse_jsonfeed/mod.ts";
import { RedditCache } from "./resources/reddit/mods.ts";
import { RSSCache } from "./resources/rss/mods.ts";
import { TwitterCache } from "./resources/twitter/mod.ts";

export type Article = Required<
  Pick<FeedItem, "id" | "url" | "title" | "content_html" | "date_published">
>;
export type Query = Record<string, string>;
export type Service = "twitter" | "reddit" | "rss";
export type Cache<T extends Service> = T extends "twitter" ? TwitterCache[]
  : T extends "reddit" ? RedditCache[]
  : T extends "rss" ? RSSCache[]
  : Article[];
