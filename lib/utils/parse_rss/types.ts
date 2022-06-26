import { Article } from "../../types.ts";

export interface RSS1 {
  "rdf:RDF": {
    channel: {
      title: string;
      link: string;
      description: string;
    };
    item: RSS1Item[];
    "@_version": string;
  };
}

export type RSS1Item = {
  guid: {
    isPermalink: boolean;
    "#text": string;
  };
  title: string;
  link: string;
  description: string;
  "dc:date": string;
  "content:encoded": string;
  "dc:creator": string;
  "dc:subject": string | string[];
};

export interface RSS2 {
  rss: {
    channel: {
      title: string;
      link: string;
      description: string;
      item: RSS2Item[];
    };
    "@_version": string;
  };
}

export type RSS2Item = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  author: string;
  category: string | string[];
};

export interface Atom {
  feed: {
    title: string | TitleAttribute;
    link: Array<LinkAttribute> | LinkAttribute;
    updated: string;
    entry: Array<{
      id: string;
      title: string | TitleAttribute;
      link: Array<LinkAttribute> | LinkAttribute;
      updated: string;
      published: string;
      content: {
        "#text": string;
        "@_type": string;
      };
      summary: {
        "#text": string;
        "@_type": string;
      };
      author: {
        name: string;
        uri: string;
        email: string;
      };
      category: Array<CategoryAttribute> | CategoryAttribute;
    }>;
  };
}

export type CategoryAttribute = {
  "@_term": string;
  "@_label": string;
};

export type LinkAttribute = {
  "@_rel": string;
  "@_type": string;
  "@_href": string;
};

export type TitleAttribute = {
  "#text": string;
  "@_type": string;
};

export type ParseResult = RSS1 | RSS2 | Atom;

export type ArticleItem = Article & { author: string; category: string[] };

export type RSSItem = {
  title: string;
  link: string;
  feedLink?: string;
  items: ArticleItem[];
};
