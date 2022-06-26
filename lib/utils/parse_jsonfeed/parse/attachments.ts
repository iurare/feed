import { parseNumberFieldOf, parseStringFieldOf, parseUrlFieldOf } from "./type.ts";
import { Attachment } from "../types.ts";

export function parseItemAttachments(arrayAttachments?: Attachment[]): Attachment[] {
  const parsedAttachments: Attachment[] = [];

  if (arrayAttachments !== null) {
    if (Array.isArray(arrayAttachments)) {
      for (const attachment of arrayAttachments) {
        const parsedAttachment = parseAttachment(attachment);

        if (parsedAttachment) {
          parsedAttachments.push(parsedAttachment);
        }
      }
    }
  }

  return parsedAttachments;
}

function parseAttachment(attachment: Attachment): Attachment | null {
  let { url, mime_type, title, size_in_bytes, duration_in_seconds } = attachment;

  url = parseUrlFieldOf(url);
  mime_type = parseStringFieldOf(mime_type);

  if (!url && !mime_type) {
    return null;
  }

  title = parseStringFieldOf(title);
  size_in_bytes = parseNumberFieldOf(size_in_bytes);
  duration_in_seconds = parseNumberFieldOf(duration_in_seconds);

  return { url, mime_type, title, size_in_bytes, duration_in_seconds };
}
