export type { TwitterCache } from "./types.ts";

import { SearchTweetsResponse, TweetResponse, TweetResult, TwitterCache } from "./types.ts";
import { Base } from "../base.ts";
import { TWITTER_ACCESS_TOKEN, TWITTER_USER_LIST } from "../../constants.ts";
import { allowedShortUrlPatterns } from "../../data/domains.ts";
import { Article, Cache, Query } from "../../types.ts";
import { request } from "../../utils/mod.ts";

type Name = "twitter";

export class Twitter extends Base<Name> {
  constructor(name: Name) {
    super(name);
  }

  async _getCleanUrl(url: string): Promise<string> {
    url = await this._expandUrl(url);
    url = this._sanitizeUrl(url);
    return url;
  }

  async _expandUrl(url: string): Promise<string> {
    if (allowedShortUrlPatterns.some((pattern) => pattern.test(url))) {
      const res = await request(url, { isRedirect: true });

      if (res.status === 301 || res.status === 302) {
        return res.headers.get("locations") ?? res.headers.get("location") ?? res.url;
      } else {
        return res.url;
      }
    } else {
      return url;
    }
  }

  _trimUrlFromTweet(tweet: string): string {
    const urlPattern = /(https|http)?:\/\/(t.co)([\/\w\.-]*)/gi;
    return tweet.replaceAll(urlPattern, "").trim();
  }

  async _fetchNewItems(): Promise<[Article[], Cache<Name>]> {
    const cache: Cache<Name> = [];
    let newItems: Article[] = [];

    const res = await request(TWITTER_USER_LIST);
    if (!res.ok) {
      console.error("No users found");
    } else {
      const data = await res.text();
      const users = data.split("\n");

      for (const user of users) {
        let cacheOfUsers = this.cache.find((item) => item.username === user);

        let cachedItems: Article[] = [];
        let sinceId = "";

        if (cacheOfUsers !== undefined) {
          const { items, newest_id } = cacheOfUsers;
          cachedItems = items;
          sinceId = newest_id;
        } else {
          cacheOfUsers = { username: user, items: cachedItems, newest_id: sinceId };
        }

        const newTweets = await this._fetchNewTweets(user, sinceId);
        if (newTweets !== null) {
          let { items, ...meta } = newTweets;
          items = this._filterNewItems(items, cachedItems);
          newItems = [...newItems, ...items];
          cacheOfUsers = { items, ...meta };
        }

        cache.push(cacheOfUsers);
      }
    }

    newItems = newItems.sort(this._sortByUpdated).reverse();
    return [newItems, cache];
  }

  async _fetchNewTweets(user: string, sinceId?: string): Promise<null | TwitterCache> {
    let endpointUrl = "https://api.twitter.com/2/tweets/search/recent";
    const queries: Query = {
      query: `from:${user} has:links`,
      expansions: "author_id",
      "tweet.fields": "created_at,referenced_tweets",
    };
    if (sinceId) {
      queries["since_id"] = sinceId;
    }

    endpointUrl = this._formatUrl(endpointUrl, queries);

    const res = await request(endpointUrl, { token: TWITTER_ACCESS_TOKEN });

    if (!res.ok) {
      console.error(`${res.status}: ${res.statusText}`);
      return null;
    } else {
      const json: SearchTweetsResponse = await res.json();
      const { data, includes, meta } = json;

      if (!data) {
        return null;
      } else {
        const { newest_id } = meta;
        const { users: [{ name, username }] } = includes;

        const items: Article[] = [];
        for (const item of data) {
          const {
            referenced_tweets,
            id: tweet_id,
            text: tweet_text,
            created_at,
          } = item;

          const tweetPermalink = this._generatePermalink(name, username, tweet_id);
          const tweetCleandText = this._trimUrlFromTweet(tweet_text);

          if (referenced_tweets) {
            const [{ type, id: referenced_id }] = referenced_tweets;

            if (type === "quoted" || type === "retweeted") {
              const tweet = await this._fetchNewTweet(referenced_id);

              if (!tweet) {
                continue;
              }

              const {
                url,
                title,
                name: referenced_name,
                username: referenced_username,
                text: referenced_text,
                description,
                imageUrl,
              } = tweet;

              const link = this._generateArticleLink(url);

              const referencedPermalink = this._generatePermalink(
                referenced_name,
                referenced_username,
                referenced_id,
              );

              const referencedContentHtml = this._generateContentHtml({
                permalink: referencedPermalink,
                text: referenced_text,
                title,
                imageUrl,
                description,
                link,
              });
              const content_html = this._generateContentHtml({
                permalink: tweetPermalink,
                text: type === "quoted" ? tweetCleandText : "",
                html: referencedContentHtml,
              });

              items.push(
                {
                  id: url,
                  url,
                  title: type === "quoted" ? tweetCleandText : referenced_text,
                  date_published: created_at,
                  content_html,
                },
              );
            }
          } else {
            const tweet = await this._fetchNewTweet(tweet_id);

            if (!tweet) {
              continue;
            }

            const { url, title, description, imageUrl } = tweet;
            const link = this._generateArticleLink(url);

            const content_html = this._generateContentHtml({
              permalink: tweetPermalink,
              text: tweetCleandText,
              title,
              imageUrl,
              description,
              link,
            });

            items.push(
              {
                id: url,
                url,
                title: tweetCleandText,
                date_published: created_at,
                content_html,
              },
            );
          }
        }

        return { username, items, newest_id };
      }
    }
  }

  async _fetchNewTweet(id: string): Promise<null | TweetResult> {
    let endpointUrl = `https://api.twitter.com/2/tweets/${id}`;
    const queries: Query = {
      "tweet.fields": "entities,referenced_tweets",
      expansions: "author_id",
      "user.fields": "",
    };

    endpointUrl = this._formatUrl(endpointUrl, queries);

    const res = await request(endpointUrl, { token: TWITTER_ACCESS_TOKEN });

    if (!res.ok) {
      console.error(`Tweet has been deleted (id: ${id})`);
      return null;
    } else {
      try {
        const json: TweetResponse = await res.json();
        const { data, includes } = json;

        let {
          entities: {
            urls: [
              {
                expanded_url,
                unwound_url,
                title,
                description,
                images,
              },
            ],
          },
          id,
          text,
        } = data;

        const { users: [{ name, username }] } = includes;

        let url = unwound_url || expanded_url;
        url = await this._getCleanUrl(url);

        text = this._trimUrlFromTweet(text);
        title = title ?? "";
        description = description ?? "";

        let imageUrl = "";
        if (images) {
          const [{ url, height, width }] = images;
          imageUrl = this._generateImageHtml(url, height, width);
        } else {
          imageUrl = "";
        }

        return {
          id,
          url,
          title,
          text,
          name,
          username,
          description,
          imageUrl,
        };
      } catch (_) {
        //console.error(`error id: ${id}`);
        return null;
      }
    }
  }

  _generateArticleLink(url: string): string {
    return `<p>Article URL: <a href="${url}">${url}</a></p>`;
  }

  _generateContentHtml(
    { permalink, text, title, imageUrl, description, link, html }: {
      permalink: string;
      text: string;
      title?: string;
      imageUrl?: string;
      description?: string;
      link?: string;
      html?: string;
    },
  ): string {
    return `\
<blockquote>
<p>${permalink} ${text}</p>
${title ? `<p><strong>${title}</strong></p>` : ""}
${imageUrl ? `<p>${imageUrl}</p>` : ""}
${description ? `<p><i>${description}</i></p>` : ""}
${link ? `${link}` : ""}
${html ? `${html}` : ""}
</blockquote>
`.replaceAll("\n", "").trim();
  }

  _generateImageHtml(url: string, height: number, width: number): string {
    return `<img src="${url}" height="${height}" width="${width}" loading="lazy" decoding="async">`;
  }

  _generatePermalink(name: string, username: string, tweetId: string): string {
    const authorName = `${name}@${username}`;
    const tweetPermalink = `https://twitter.com/${username}/status/${tweetId}`;
    return `<a href="${tweetPermalink}">${authorName}</a>`;
  }
}
