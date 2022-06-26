export class CleanUrl {
  readonly url: string;
  readonly protocol: string;
  readonly hostname: string;
  pathname: string;
  query: string;
  fragment: string;

  constructor(url: string) {
    this.url = url;
    const { protocol, hostname, pathname, search, hash } = new URL(this.url);
    this.protocol = protocol.replace(":", "");
    this.hostname = hostname;
    this.pathname = pathname;
    this.query = search.replace("?", "");
    this.fragment = hash;
  }

  getUrl(): string {
    return this._unparseUrl();
  }

  _unparseUrl(): string {
    const url = new URL(this.url);
    url.protocol = this.protocol;
    url.hostname = this.hostname;
    url.pathname = this.pathname;
    url.search = this.query;
    url.hash = this.fragment;

    return decodeURIComponent(url.toString());
  }
}
