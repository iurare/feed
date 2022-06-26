export type { RedditCache } from "./types.ts";

import { RedditResponse } from "./types.ts";
import { Base } from "../base.ts";
import { subreddits } from "../../data/subreddits.ts";
import { request } from "../../utils/mod.ts";
import { Article, Cache, Query } from "../../types.ts";

type Name = "reddit";

export class Reddit extends Base<Name> {
  constructor(name: Name) {
    super(name);
  }

  async _fetchNewItems(): Promise<[Article[], Cache<Name>]> {
    const cache: Cache<Name> = [];
    let newItems: Article[] = [];

    for (const subreddit of subreddits) {
      let cacheOfSubreddit = this.cache.find((item) => item.subreddit === subreddit);

      let cachedItems: Article[] = [];

      if (cacheOfSubreddit !== undefined) {
        const { items } = cacheOfSubreddit;
        cachedItems = items;
      } else {
        cacheOfSubreddit = { subreddit, items: cachedItems };
      }

      let items = await this._getNewItem(subreddit);
      if (items !== null) {
        items = this._filterNewItems(items, cachedItems);
        newItems = [...newItems, ...items];
        cacheOfSubreddit = { subreddit, items };
      }
      cache.push(cacheOfSubreddit);
    }

    newItems = newItems.sort(this._sortByUpdated).reverse();
    return [newItems, cache];
  }

  _isUrl(url: string): boolean {
    return new RegExp("^https:\\/\\/(?:[a-z0-9-]+\\.)*?.*").test(url);
  }

  async _getNewItem(subreddit: string): Promise<Article[] | null> {
    let endpointURL = `https://www.reddit.com/r/${subreddit}/hot.json`;
    const queries: Query = { limit: String(20) };

    endpointURL = this._formatUrl(endpointURL, queries);

    const res = await request(endpointURL);

    if (!res.ok) {
      return null;
    } else {
      const json: RedditResponse = await res.json();
      const { data: { children } } = json;

      if (!children) {
        return null;
      } else {
        const items: Article[] = [];
        for (const item of children) {
          const { data } = item;

          let {
            created,
            link_flair_css_class,
            link_flair_text,
            num_comments,
            permalink,
            score,
            subreddit_name_prefixed,
            title: postTitle,
            url,
          } = data;

          if (link_flair_css_class !== "meta") {
            if (this._isUrl(url) && score >= 250) {
              url = this._sanitizeUrl(url);

              const link = this._generateArticleLink(url);
              const [title, titleHtml] = this._generateTitleHtml(
                postTitle,
                subreddit_name_prefixed,
                link_flair_text,
              );
              const entryPermalink = this._generatePermalink(permalink);
              const content_html = this._generateContentHtml({
                title: titleHtml,
                link,
                score,
                permalink: entryPermalink,
                num_comments,
              });

              const timestamp = created * 1000;
              const date_published = new Date(timestamp).toISOString();

              items.push(
                { id: url, title, url, content_html, date_published },
              );
            }
          }
        }
        return items;
      }
    }
  }

  _generateArticleLink(url: string): string {
    return `<p>Article URL: <a href="${url}">${url}</a></p>`;
  }

  _generateContentHtml(
    { title, link, score, permalink, num_comments }: {
      title: string;
      link: string;
      score: number;
      permalink: string;
      num_comments: number;
    },
  ): string {
    const scoreHtml = `<p>Score: ${score}</p>`;
    const commentCountHtml = `<p>Comments: ${num_comments}</p>`;

    return `\
<blockquote>
${title}
${link}
${scoreHtml}
${permalink}
${commentCountHtml}
</blockquote>
`.replaceAll("\n", "");
  }

  _generatePermalink(url: string): string {
    const commentUrl = `https://old.reddit.com${url}`;
    return `<p>Comments URL: <a href="${commentUrl}">${commentUrl}</a></p>`;
  }

  _generateTitleHtml(
    title: string,
    redditname: string,
    flairText: null | string,
  ): [string, string] {
    let postTitle: string;
    if (flairText) {
      postTitle = `[${flairText} - ${redditname}] ${title}`;
    } else {
      postTitle = `[${redditname}] ${title}`;
    }

    return [postTitle, `<p>${postTitle}</p>`];
  }
}
