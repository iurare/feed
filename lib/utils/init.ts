import { ensureDir } from "fs";

import { CACHE_DIR, OUTPUT } from "../constants.ts";

export async function init(): Promise<void> {
  await ensureDir(OUTPUT);
  await ensureDir(CACHE_DIR);
}
