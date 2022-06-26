export class RSSParserError extends Error {
  name: string;

  constructor(message: string) {
    super(message);
    this.name = "RSSParserError";
  }
}
