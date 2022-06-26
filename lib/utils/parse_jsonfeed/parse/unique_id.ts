export function parseItemUniqueId(id: string): string {
  if (typeof id === "string") {
    return id;
  } else {
    /* if id is number, even if it's incorrect, id should be coerced to a string */
    return `${id}`;
  }
}
