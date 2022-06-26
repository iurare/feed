import { XMLParser } from "fast-xml-parser";

import { parseAtom } from "./atom.ts";
import { RSSParserError } from "./error.ts";
import { ParseResult, RSSItem } from "./types.ts";
import { parseRss1, parseRss2 } from "./rss.ts";

const parser = new XMLParser({ ignoreAttributes: false });

export function parseRss(document: string): RSSItem {
  const parsed: ParseResult = parser.parse(document);
  let feed = {} as RSSItem;

  if ("rdf:RDF" in parsed) {
    feed = parseRss1(parsed);
  } else if ("rss" in parsed) {
    if (parsed.rss["@_version"].match(/^2/)) {
      feed = parseRss2(parsed);
    } else if (parsed.rss["@_version"].match(/0\.9/)) {
      feed = parseRss2(parsed);
    } else {
      throw new RSSParserError("The string to parse is not valid XML document");
    }
  } else if ("feed" in parsed) {
    feed = parseAtom(parsed);
  } else {
    throw new RSSParserError("The string to parse is not valid XML document");
  }

  return feed;
}
