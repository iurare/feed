import { Attachment, Author } from "./types.ts";

export function isUrl(url: string): boolean {
  return new RegExp("^https?:\\/\\/(?:[a-z0-9-]+\\.)*?[a-z0-9-]+(?:\\.[a-z]{2,}){1,}").test(url);
}

export function isEmail(email: string): boolean {
  return new RegExp("([a-z0-9_\.-]+)@[a-z0-9-]+(?:\\.[a-z]{2,}){1,}").test(email);
}

export function isHtml(html: string): boolean {
  return new RegExp("<[^>]+>").test(html);
}

export function generateMailtoLink(email: string): string {
  if (!/mailto\:/.test(email)) {
    return email.replace(new RegExp("([a-z0-9_\.-]+)@[a-z0-9-]+(?:\\.[a-z]{2,}){1,}"), "mailto:$&");
  }

  return email;
}

export async function generateUniqueId(
  { date_published, title, external_url, authors, attachments, content_html, content_text }: {
    date_published?: string;
    title?: string;
    external_url?: string;
    authors?: Author[];
    attachments?: Attachment[];
    content_html?: string;
    content_text?: string;
  },
) {
  /**
   * if a required `id` field does not exist, generates an unique id based on a
   * combination of other no-empty fields and then hash the result
   */

  let id = "";

  if (date_published) {
    const timestamp = new Date(date_published).getTime();
    id = `${timestamp}`;
  }

  if (title) {
    id += title;
  }

  if (external_url) {
    id += external_url;
  }

  if (authors) {
    id += authors[0]?.url ?? "";
  }

  if (attachments) {
    id += attachments[0]?.url ?? "";
  }

  if (!id) {
    if (content_html) {
      id += content_html;
    }
    if (content_text) {
      id += content_text;
    }
  }

  id = await digestMessage(id);

  return id;
}

async function digestMessage(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

export function convertHtmlToPlainText(html: string): string {
  const htmlPattern = new RegExp("<[^>]+>", "ig");
  const prettyHtml = html.split("\n").join("");
  const plainText = prettyHtml.split(htmlPattern).filter(Boolean).join("").trim();

  return plainText;
}

export function uniqWith<T>(data: T[]): T[] {
  const _isEqual = (a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);
  return data.filter((elem, index) => data.findIndex((step) => _isEqual(elem, step)) === index);
}
