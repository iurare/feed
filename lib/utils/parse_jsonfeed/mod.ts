export type { FeedItem } from "./types.ts";

import { JSONFeedParserError } from "./error.ts";
import * as _ from "./parse/mod.ts";
import { JSONFeed } from "./types.ts";
import { uniqWith } from "./utils.ts";

export async function parseJsonFeed(document: string): Promise<JSONFeed> {
  try {
    const parsed = JSON.parse(document);

    /**
     * Top-level fields:
     *
     * `verion`, `title`, `items` must be within JSON Feed
     */
    const version = _.parseRequiredVersion(parsed.version);
    const title = _.parseRequiredTitle(parsed.title);
    let items = _.parseRequiredArrayItems(parsed.items);

    let authors = _.parseArrayAuthors(parsed.authors);
    const author = _.parseDeprecatedAuthor(parsed.author);
    if (author) {
      authors = uniqWith([...authors, ...author]);
    }

    const home_page_url = _.parseUrlFieldOf(parsed.home_page_url);
    const feed_url = _.parseUrlFieldOf(parsed.feed_url);
    const description = _.parseStringFieldOf(parsed.description);
    const user_comment = _.parseStringFieldOf(parsed.user_comment);
    const next_url = _.parseUrlFieldOf(parsed.next_url);
    const icon = _.parseUrlFieldOf(parsed.icon);
    const favicon = _.parseUrlFieldOf(parsed.favicon);
    const language = _.parseStringFieldOf(parsed.language);
    const expired = _.parseBooleanFieldOf(parsed.expired);
    const hubs = _.parseArrayHubs(parsed.hubs);

    /* Items field */
    items = await _.parseFeedItems(items);

    return {
      version,
      title,
      home_page_url,
      feed_url,
      description,
      user_comment,
      next_url,
      icon,
      favicon,
      authors,
      language,
      expired,
      hubs,
      items,
    };
  } catch (_) {
    throw new JSONFeedParserError("The string to parse is not valid JSON");
  }
}
