import { Article } from "../../types.ts";

export interface RedditCache {
  subreddit: string;
  items: Article[];
}

export interface RedditResponse {
  data: Posts;
}

interface Posts {
  children: Post[];
}

interface Post {
  data: Metadata;
}

export interface Metadata {
  created: number;
  link_flair_css_class: null | string;
  link_flair_text: null | string;
  num_comments: number;
  permalink: string;
  score: number;
  subreddit_name_prefixed: string;
  title: string;
  url: string;
}
