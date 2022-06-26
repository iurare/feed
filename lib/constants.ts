import { parse } from "flags";
import { join } from "path";

export const CWD = Deno.cwd();
export const OUTPUT = join(CWD, "output");
export const CACHE_DIR = join(OUTPUT, "cache");

export const BASE_URL = "https://iurare.github.io/feed";
export const HOME_PAGE = "https://github.com/iurare";
export const FEED_ICON = "https://avatars.githubusercontent.com/u/16333253";
export const NOW = Date.now();
export const CACHE_AGE = 1;

const args = parse(Deno.args);
export const TWITTER_ACCESS_TOKEN: string = args["twitter-access-token"];
export const TWITTER_USER_LIST = args["twitter-user-list"];
export const RSS_LIST = args["rss-list"];

if (!TWITTER_USER_LIST || !TWITTER_USER_LIST || !RSS_LIST) {
  throw new Error("No token or URL provided");
}
