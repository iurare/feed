import { Reddit, RSS, Twitter } from "./lib/resources/mod.ts";
import { init } from "./lib/utils/mod.ts"

await init();
try {
  await Promise.all([
    new Twitter("twitter").update(),
    new RSS("rss").update(),
    new Reddit("reddit").update(),
  ]);
} catch (e) {
  console.error(e);
  Deno.exit(1);
}
