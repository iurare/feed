import { convertHtmlToPlainText, isHtml } from "../utils.ts";

export function parseItemSummary(summary?: string): string {
  let itemSummary;

  if (summary) {
    if (typeof summary !== "string") {
      itemSummary = "";
    } else {
      if (isHtml(summary)) {
        /* `summary` field must be a plain text */
        itemSummary = convertHtmlToPlainText(summary);
      } else {
        itemSummary = summary;
      }
    }
  } else {
    itemSummary = "";
  }

  return itemSummary;
}
