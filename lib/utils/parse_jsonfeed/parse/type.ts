import { generateMailtoLink, isEmail, isUrl } from "../utils.ts";

export function parseUrlFieldOf(field?: string): string {
  let parsedUrl;

  if (field) {
    if (typeof field !== "string") {
      parsedUrl = "";
    } else {
      if (isUrl(field)) {
        parsedUrl = field;
      } else if (isEmail(field)) {
        parsedUrl = generateMailtoLink(field);
      } else {
        parsedUrl = "";
      }
    }
  } else {
    parsedUrl = "";
  }

  return parsedUrl;
}

export function parseStringFieldOf(field?: string): string {
  let result;

  if (field) {
    if (typeof field !== "string") {
      result = "";
    } else {
      result = field;
    }
  } else {
    result = "";
  }

  return result;
}

export function parseBooleanFieldOf(field?: boolean): boolean {
  let result;

  if (field) {
    if (typeof field !== "boolean") {
      result = false;
    } else {
      result = field;
    }
  } else {
    result = false;
  }

  return result;
}

export function parseNumberFieldOf(field?: number): number {
  let result;

  if (field) {
    if (typeof field !== "number") {
      result = NaN;
    } else {
      result = field;
    }
  } else {
    result = NaN;
  }

  return result;
}

export function parseDateFieldOf(field?: string): string {
  let result;

  if (field) {
    if (typeof field !== "string") {
      result = "";
    } else {
      try {
        const date = new Date(field);
        return date.toISOString();
      } catch (_) {
        return "";
      }
    }
  } else {
    return "";
  }

  return result;
}
