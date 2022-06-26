import { Article } from "../../types.ts";

export interface TwitterCache {
  username: string;
  newest_id: string;
  items: Article[];
}

export interface SearchTweetsResponse {
  data: SearchTweet[];
  includes: Includes;
  meta: Meta;
}

interface SearchTweet {
  id: string;
  text: string;
  created_at: string;
  entities: Entities;
  referenced_tweets: ReferencedTweetData[];
}

export interface TweetResponse {
  data: Tweet;
  includes: Includes;
}

interface Tweet {
  id: string;
  text: string;
  entities: Entities;
}

interface Entities {
  urls: TweetURL[];
}

interface TweetURL {
  expanded_url: string;
  unwound_url?: string;
  title?: string;
  description?: string;
  images?: Image[];
}

interface Image {
  url: string;
  width: number;
  height: number;
}

export interface TweetResult {
  id: string;
  url: string;
  title: string;
  text: string;
  name: string;
  username: string;
  description?: string;
  imageUrl: string;
}

interface ReferencedTweetData {
  type: "retweeted" | "quoted" | "replied_to";
  id: string;
}

interface Includes {
  users: TweetUser[];
}

interface TweetUser {
  id: string;
  name: string;
  username: string;
}

interface Meta {
  newest_id: string;
}
