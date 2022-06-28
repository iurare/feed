import { join } from "path";

import { BASE_URL, CACHE_AGE, CACHE_DIR, FEED_ICON, HOME_PAGE, NOW, OUTPUT } from "../constants.ts";
import { Article, Cache, Query, Service } from "../types.ts";
import { ignoredDomainPatterns } from "../data/domains.ts";
import { formatUrl, request, sanitizeUrl } from "../utils/mod.ts";

export abstract class Base<T extends Service> {
  readonly name: T;
  readonly fname: string;
  readonly fpath: string;
  readonly cachedName: string;
  readonly cachedPath: string;
  cache: Cache<T>;

  constructor(name: T) {
    this.name = name;
    this.fname = `${this.name}.json`;
    this.fpath = join(OUTPUT, this.fname);
    this.cachedName = `${this.name}.cache.json`;
    this.cachedPath = join(CACHE_DIR, this.cachedName);
    this.cache = [] as unknown[] as Cache<T>;
  }

  abstract _fetchNewItems(): Promise<[Article[], Cache<T>]>;

  async _getCacheItems(): Promise<void> {
    const cachedUrl = `${BASE_URL}/cache/${this.cachedName}`;

    const res = await request(cachedUrl);
    if (res.ok) {
      try {
        this.cache = await res.json();
      } catch (_) {
        /* do nothing */
      }
    }
  }

  _formatUrl(url: string, queries: Query): string {
    return formatUrl(url, queries);
  }

  _sanitizeUrl(url: string): string {
    return sanitizeUrl(url);
  }

  _sortByUpdated(a: Article, b: Article): 1 | 0 | -1 {
    return a.date_published > b.date_published ? 1 : a.date_published === b.date_published ? 0 : -1;
  }

  _filterByCacheAge(item: Article): boolean {
    const { date_published } = item;
    const timestamp = new Date(date_published).getTime();
    const diff = NOW - timestamp;
    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    return Math.round(diff / millisecondsPerDay) < CACHE_AGE;
  }

  _filterNewItems(newItems: Article[], cache: Article[]): Article[] {
    const ids = cache.map((item) => item.id);
    return newItems
      .flat()
      .filter(Boolean)
      .filter((item) => {
        const { url } = item;
        return new RegExp("^https:\\/\\/").test(url) && /** allow only https **/
          !ignoredDomainPatterns.some((pattern) => pattern.test(url));
      })
      .reduce((prev, curr) => {
        if (!ids.includes(curr.id)) {
          prev.push(curr);
        }
        return prev;
      }, cache)
      .filter(this._filterByCacheAge)
      .sort(this._sortByUpdated)
      .reverse();
  }

  _prettyHtml(html: string): string {
    return html.split(/\s/).filter(Boolean).join(" ").trim();
  }

  async _updateCaches(cache: Cache<T>): Promise<void> {
    await Deno.writeTextFile(this.cachedPath, JSON.stringify(cache));
  }

  async _buildJsonFeed(items: Article[]): Promise<void> {
    const jsonfeed = {
      version: "https://jsonfeed.org/version/1.1",
      title: `@iurare/${this.name}`,
      home_page_url: HOME_PAGE,
      feed_url: `${BASE_URL}/${this.fname}`,
      icon: FEED_ICON,
      items,
    };

    await Deno.writeTextFile(this.fpath, JSON.stringify(jsonfeed));
  }

  async update(): Promise<void> {
    await this._getCacheItems();
    const [newItems, cache] = await this._fetchNewItems();

    await this._updateCaches(cache);
    await this._buildJsonFeed(newItems);
  }
}
