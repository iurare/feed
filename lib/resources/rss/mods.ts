export type { RSSCache } from "./types.ts";

import { Base } from "../base.ts";
import { RSS_LIST } from "../../constants.ts";
import { request } from "../../utils/mod.ts";
import { parseRss } from "../../utils/parse_rss/mod.ts";
import { Article, Cache } from "../../types.ts";

type Name = "rss";

export class RSS extends Base<Name> {
  constructor(name: Name) {
    super(name);
  }

  async _fetchNewItems(): Promise<[Article[], Cache<Name>]> {
    const cache: Cache<Name> = [];
    let newItems: Article[] = [];

    const res = await request(RSS_LIST);
    if (!res.ok) {
      console.error("No URL found");
    } else {
      const data = await res.text();
      const rssList = data.split("\n");

      for (const feedUrl of rssList) {
        let cacheOfFeed = this.cache.find((item) => item.feedUrl === feedUrl);

        let cachedItems: Article[] = [];

        if (cacheOfFeed !== undefined) {
          const { items } = cacheOfFeed;
          cachedItems = items;
        } else {
          cacheOfFeed = { feedUrl, items: cachedItems };
        }

        let items = await this._fetchNewItem(feedUrl);
        if (items !== null) {
          items = this._filterNewItems(items, cachedItems);
          newItems = [...newItems, ...items];
          cacheOfFeed = { ...cacheOfFeed, items };
        }

        cache.push(cacheOfFeed);
      }
    }

    newItems = newItems.sort(this._sortByUpdated).reverse();
    return [newItems, cache];
  }

  async _fetchNewItem(url: string): Promise<Article[] | null> {
    let newItems: Article[] = [];

    const res = await request(url);

    if (!res.ok) {
      console.error(`${url} (${res.status}: ${res.statusText})`);
      return null;
    } else {
      const xml = await res.text();
      try {
        const parsedItems = parseRss(xml);
        const { title: rssTitle, link: rssLink, items: rssItems } = parsedItems;

        const items = rssItems.map((item) => {
          const url = this._sanitizeUrl(item.url);
          const permalink = this._generateArticleLink(url);
          const header = this._generateHeader({ title: rssTitle, link: rssLink });
          const content_html = this._generateContentHtml({
            permalink,
            header,
            title: item.title,
            html: item.content_html,
            author: item.author,
            category: item.category,
          });

          return {
            id: url,
            url,
            title: item.title,
            content_html,
            date_published: item.date_published,
          };
        });

        newItems = [...newItems, ...items];

        return newItems;
      } catch (e) {
        console.error(`${url}: ${e.message})`);
        return null;
      }
    }
  }

  _generateArticleLink(url: string): string {
    return `<p>Article URL: <a href="${url}">${url}</a></p>`;
  }

  _generateHeader({ title, link }: { title: string; link: string }): string {
    return `<a href="${link}">${title}</a>`;
  }

  _generateContentHtml(
    { permalink, header, title, html, author, category }: {
      permalink: string;
      header: string;
      title: string;
      html: string;
      author: string;
      category: string[];
    },
  ): string {
    let categories = "";
    if (category) {
      categories = category.reduce((prev, curr) => {
        prev += `<i>#${curr}</i> `;
        return prev;
      }, "").trim();
    }

    const rv = `\
      <blockquote>
        <p>${header} <strong>${title}</strong></p>
        <p>${author !== "" ? `by ${author}` : ""} ${categories !== "" ? `${categories}` : ""}</p>
        ${html}
        ${permalink}
      </blockquote>
      `;
    return this._prettyHtml(rv);
  }
}
