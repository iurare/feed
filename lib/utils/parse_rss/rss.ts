import { decode } from "html-entities";

import { ArticleItem, RSS1, RSS1Item, RSS2, RSS2Item, RSSItem } from "./types.ts";

function parseRss(item: RSS1Item[] | RSS2Item[], version: "1" | "2") {
  const items: ArticleItem[] = [];

  for (const i of item) {
    if (!i.link) continue;

    const title = decode(i.title);
    const url = i.link;
    let id = url;

    let content = "";
    if ("content:encoded" in i) {
      content = i["content:encoded"];
    } else if ("description" in i) {
      content = i.description;
    }

    let updated = "";
    let category: string[] = [];
    let author = "";
    switch (version) {
      case "1":
        if ("guid" in i) {
          id = i.guid["#text"];
        }
        if ("dc:date" in i) {
          updated = new Date(i["dc:date"]).toISOString();
        }
        if ("dc:subject" in i) {
          if (Array.isArray(i["dc:subject"])) {
            category = i["dc:subject"].map((category) => decode(category))
              .filter(
                Boolean,
              );
          } else {
            category.push(decode(i["dc:subject"]));
          }
        }
        if ("dc:creator" in i) {
          author = decode(i["dc:creator"]);
        }
        break;
      case "2":
        if ("pubDate" in i) {
          updated = new Date(i.pubDate).toISOString();
        }
        if ("category" in i) {
          if (Array.isArray(i.category)) {
            category = i.category.map((category) => decode(category)).filter(
              Boolean,
            );
          } else {
            category.push(decode(i.category));
          }
        }
        if ("author" in i) {
          author = decode(i.author);
        }
        break;
    }

    if (!updated) {
      updated = new Date(Date.now()).toISOString();
    }

    const content_html = decode(content).trim();
    const date_published = new Date(updated).toISOString();

    items.push({
      id,
      url,
      title,
      author,
      category,
      content_html,
      date_published,
    });
  }

  return items;
}

export function parseRss1(document: RSS1): RSSItem {
  let { channel: { title, link }, item } = document["rdf:RDF"];
  title = decode(title);
  const items = parseRss(item, "1");

  return { title, link, items };
}

export function parseRss2(document: RSS2): RSSItem {
  let { rss: { channel: { title, link, item } } } = document;
  title = decode(title);
  const items = parseRss(item, "2");

  return { title, link, items };
}
