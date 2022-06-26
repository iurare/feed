import { decode } from "html-entities";
import { ArticleItem, Atom, LinkAttribute, RSSItem } from "./types.ts";
import { NOW } from "../../constants.ts";

export function parseAtom(document: Atom): RSSItem {
  const { feed: { title: _pageTitle, link, entry } } = document;

  let pageTitle = "";
  if (typeof _pageTitle === "object") {
    pageTitle = decode(_pageTitle["#text"]);
  } else {
    pageTitle = decode(_pageTitle);
  }

  const pageLink = getLink(link, "alternate") ?? "";
  const feedLink = getLink(link, "self") ?? "";

  const items: ArticleItem[] = [];
  for (const e of entry) {
    const pageLink = getLink(e.link, "alternate");
    if (pageLink === null) continue;

    const id = e.id || pageLink;

    let title = "";
    if (typeof e.title === "object") {
      title = decode(e.title["#text"]);
    } else {
      title = decode(e.title);
    }

    let content = "";
    if ("content" in e) {
      content = e.content["#text"];
    } else if ("summary" in e) {
      content = e.summary["#text"];
    }

    let updated = "";
    if ("updated" in e) {
      updated = e.updated;
    } else if ("published" in e) {
      updated = e.published;
    }
    const isoFormatPattern =
      /(\d{4})[-\/]?(\d{1,2})?[-\/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?/;
    if (!updated || !isoFormatPattern.test(updated)) {
      updated = new Date(NOW).toISOString();
    } else {
      const matched = updated.match(isoFormatPattern);
      if (matched !== null) {
        updated = new Date(matched[0]).toISOString();
      } else {
        updated = new Date(NOW).toISOString();
      }
    }

    let category: string[] = [];
    if ("category" in e) {
      if (Array.isArray(e.category)) {
        category = e.category.map((category) => decode(category["@_term"] || category["@_label"]))
          .filter(Boolean);
      } else {
        category.push(decode(e.category["@_term"] || e.category["@_label"]));
      }
    }

    let author = "";
    if ("author" in e) {
      author = decode(e.author.name);
    }

    const content_html = decode(content).trim();

    items.push({
      id,
      url: pageLink,
      title,
      author,
      category,
      date_published: updated,
      content_html,
    });
  }

  return { title: pageTitle, link: pageLink, feedLink, items };
}

function getLink(links: LinkAttribute[] | LinkAttribute, rel: "alternate" | "self"): string | null {
  if (!links) return null;

  let link = null;
  if (Array.isArray(links)) {
    link = links.find((link) => link["@_rel"] === rel);
    if (link === undefined) {
      if ("@_href" in links[0]) {
        link = links[0];
      } else {
        return null;
      }
    }
  } else {
    link = links;
  }

  return link !== null ? link["@_href"] : null;
}
