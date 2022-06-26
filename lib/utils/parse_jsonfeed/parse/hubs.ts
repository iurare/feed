import { parseStringFieldOf, parseUrlFieldOf } from "./type.ts";
import { Hub } from "../types.ts";
import { uniqWith } from "../utils.ts";

export function parseArrayHubs(arrayHubs?: Hub[]): Hub[] {
  let parsedHubs: Hub[] = [];

  if (arrayHubs) {
    if (Array.isArray(arrayHubs)) {
      for (const hub of arrayHubs) {
        const parsedHub = parseHub(hub);

        if (parsedHub) {
          parsedHubs.push(parsedHub);
        }
      }
    }
  }

  parsedHubs = uniqWith(parsedHubs);
  return parsedHubs;
}

function parseHub(hub: Hub): null | Hub {
  let { type, url } = hub;

  type = parseStringFieldOf(type);
  url = parseUrlFieldOf(url);

  if (!type || !url) {
    return null;
  } else {
    return { type, url };
  }
}
