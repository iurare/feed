import { parseStringFieldOf, parseUrlFieldOf } from "./type.ts";
import { Author } from "../types.ts";
import { uniqWith } from "../utils.ts";

export function parseArrayAuthors(arrayAuthors?: Author[]): Author[] {
  let parsedAuthors: Author[] = [];

  if (arrayAuthors) {
    if (Array.isArray(arrayAuthors)) {
      for (const author of arrayAuthors) {
        const parsedAuthor = parseAuthor(author);

        if (parsedAuthor) {
          parsedAuthors.push(parsedAuthor);
        }
      }
    }
  }

  parsedAuthors = uniqWith(parsedAuthors);
  return parsedAuthors;
}

function parseAuthor(author: Author): null | Author {
  let { name, url, avatar } = author;

  name = parseStringFieldOf(name);
  url = parseUrlFieldOf(url);
  avatar = parseUrlFieldOf(avatar);

  if (!name && !url && !avatar) {
    return null;
  } else {
    return { name, url, avatar };
  }
}

export function parseDeprecatedAuthor(author?: Author): Author[] {
  /**
   * `author` field which specified in v1.0 no longer use in v1.1
   * but the deprecated field remains in some feeds even in v1.1
   *
   * this function convert a single `Author` object to an array of `Author`
   */
  const result: Author[] = [];

  if (author) {
    const parsedAuthor = parseAuthor(author);
    if (parsedAuthor) {
      return [parsedAuthor];
    }
  }

  return result;
}
