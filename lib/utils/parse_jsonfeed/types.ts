export interface JSONFeed {
  version: string;
  title: string;
  home_page_url?: string;
  feed_url?: string;
  description?: string;
  user_comment?: string;
  next_url?: string;
  icon?: string;
  favicon?: string;
  author?: Author;
  authors?: Author[];
  language?: string;
  expired?: boolean;
  hubs?: Hub[];
  items: FeedItem[];
}

export interface Hub {
  type: string;
  url: string;
}

export interface Author {
  name?: string;
  url?: string;
  avatar?: string;
}

export interface FeedItem {
  id: string;
  url?: string;
  external_url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  summary?: string;
  image?: string;
  banner_image?: string;
  date_published?: string;
  date_modified?: string;
  author?: Author;
  authors?: Author[];
  tags?: string[];
  language?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  url: string;
  mime_type: string;
  title?: string;
  size_in_bytes?: number;
  duration_in_seconds?: number;
}
