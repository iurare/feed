import { JSONFeedParserError } from "../error.ts";
import { FeedItem } from "../types.ts";

export function parseRequiredVersion(version?: string): string {
  if (version) {
    if (typeof version !== "string") {
      throw new JSONFeedParserError("'version' field must be string");
    }
    if (!new RegExp("^https?:\\/\\/jsonfeed.org/version").test(version)) {
      throw new JSONFeedParserError(
        "'version' field must be the URL of the version of the format the feed uses",
      );
    }
    return version;
  } else {
    throw new JSONFeedParserError("'version' field must be provided");
  }
}

export function parseRequiredTitle(title?: string): string {
  if (title) {
    if (typeof title !== "string") {
      throw new JSONFeedParserError("'title' field must be string");
    }
    return title;
  } else {
    throw new JSONFeedParserError("'title' field must be provided");
  }
}

export function parseRequiredArrayItems(arrayItems?: FeedItem[]): FeedItem[] {
  if (arrayItems) {
    if (!Array.isArray(arrayItems)) {
      throw new JSONFeedParserError("'items' field must be an array");
    } else {
      return arrayItems;
    }
  } else {
    throw new JSONFeedParserError("'items' field must be provided");
  }
}
