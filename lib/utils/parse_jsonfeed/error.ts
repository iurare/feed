export class JSONFeedParserError extends Error {
  name: string;

  constructor(message: string) {
    super(message);
    this.name = "JSONFeedParserError";
  }
}
