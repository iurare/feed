import { parseArrayAuthors, parseDeprecatedAuthor } from "./authors.ts";
import { parseItemAttachments } from "./attachments.ts";
import { parseItemContentHtmlAndText } from "./content.ts";
import { parseItemSummary } from "./summary.ts";
import { parseItemTags } from "./tags.ts";
import { parseDateFieldOf, parseStringFieldOf, parseUrlFieldOf } from "./type.ts";
import { parseItemUniqueId } from "./unique_id.ts";
import { FeedItem } from "../types.ts";
import { generateUniqueId, uniqWith } from "../utils.ts";

export async function parseItem(feedItem: FeedItem): Promise<null | FeedItem> {
  let id = parseItemUniqueId(feedItem.id);
  const url = parseUrlFieldOf(feedItem.url);
  const external_url = parseUrlFieldOf(feedItem.external_url);
  const title = parseStringFieldOf(feedItem.title);
  const [content_html, content_text] = parseItemContentHtmlAndText(
    feedItem.content_html,
    feedItem.content_text,
  );

  if (!title && !content_html && !content_text) {
    return null;
  }

  const summary = parseItemSummary(feedItem.summary);
  const image = parseUrlFieldOf(feedItem.image);
  const banner_image = parseUrlFieldOf(feedItem.banner_image);
  const date_published = parseDateFieldOf(feedItem.date_published);
  const date_modified = parseDateFieldOf(feedItem.date_modified);

  let authors = parseArrayAuthors(feedItem.authors);
  const author = parseDeprecatedAuthor(feedItem.author);
  if (author) {
    authors = uniqWith([...authors, ...author]);
  }

  const tags = parseItemTags(feedItem.tags);
  const language = parseStringFieldOf(feedItem.language);
  const attachments = parseItemAttachments(feedItem.attachments);

  if (!id) {
    id = await generateUniqueId({
      date_published,
      title,
      external_url,
      authors,
      attachments,
      content_html,
      content_text,
    });
  }

  return {
    id,
    url,
    external_url,
    title,
    content_html,
    content_text,
    summary,
    image,
    banner_image,
    date_published,
    date_modified,
    authors,
    tags,
    language,
    attachments,
  };
}
