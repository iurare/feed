import { isHtml } from "../utils.ts";

export function parseItemContentHtmlAndText(html?: string, text?: string): [string, string] {
  let contentHtml = "";
  let contentText = "";

  if (html) {
    if (typeof html !== "string") {
      contentHtml = "";
    } else {
      if (isHtml(html)) {
        contentHtml = html;
      } else {
        contentHtml = "";
        contentText = html;
      }
    }
  } else {
    contentHtml = "";
  }

  if (text) {
    if (typeof text !== "string") {
      contentText = "";
    } else {
      contentText = text;
    }
  } else {
    contentText = contentText || "";
  }

  return [contentHtml, contentText];
}
