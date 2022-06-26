import { Query } from "../types.ts";

export function formatUrl(url: string, queries: Query): string {
  const u = new URL(url);
  u.search = new URLSearchParams(queries).toString();

  return decodeURIComponent(u.toString());
}
