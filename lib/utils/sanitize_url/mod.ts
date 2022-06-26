import { readRuleFile, readRuleSets, rulePath } from "./rulesets.ts";
import { CleanUrl } from "./wrapper.ts";

/**
 * Remove tracking fields from the given URL
 *
 * For example:
 * > let url = "https://example.com?utm_source=Twitter&utm_medium=ShareButton&utm_campaign=GetSocial"
 * > sanitizeURL(url)
 * https://example.ocm
 *
 * > url = "https://www.amazon.co.jp/dp/4873119707/ref=sr_1_1?keywords=javascript&m=AN1VRQENFRJN5&qid=1643641432&refinements=p_6%3AAN1VRQENFRJN5&sr=8-1"
 * > sanitizeURL(url)
 * https://www.amazon.co.jp/dp/4873119707
 *
 * > url = "https://www.google.com/url?q=https://example.com?utm_source=Twitter&utm_medium=ShareButton&utm_campaign=GetSocial"
 * > sanitizeURL(url)
 * https://example.com/
 */
export function sanitizeUrl(url: string): string {
  const data = readRuleFile(rulePath);
  const ruleSets = readRuleSets(data);

  const provider = ruleSets.find((rule) => rule.urlPattern.test(url));

  if (!provider) {
    return url;
  } else {
    const {
      completeProvider,
      exceptions,
      redirections,
      rules,
      referralMarketing,
      rawRules,
    } = provider;

    let u = new CleanUrl(url);

    if (completeProvider) {
      return u.getUrl();
    }

    /** No sanitization is done if URL matches an exception **/
    let exceptionMatched = null;
    for (const exceptionPattern of exceptions) {
      if (exceptionPattern.test(u.getUrl())) {
        exceptionMatched = true;
        break;
      }
    }

    if (exceptionMatched) {
      return u.getUrl();
    }

    /** Extract the final URL that should be redirected **/
    for (const redirectionPattern of redirections) {
      const result = u.getUrl().match(redirectionPattern)?.[1];

      if (!result) {
        continue;
      }

      if (result === url) {
        continue;
      }

      /** Some final URLs do not include URL scheme **/
      const hasProtocol = new RegExp("^https?:\/\/").test(result);
      if (!hasProtocol) {
        u = new CleanUrl(`https://${result}`);
      } else {
        u = new CleanUrl(result);
      }
      return sanitizeUrl(u.getUrl());
    }

    /** Clean tracking queries from the URL **/
    if (u.query) {
      /** Tracking fields **/
      for (const rulePattern of rules) {
        const result = u.query.match(rulePattern)?.[1];

        if (!result) {
          u.query = "";
          break;
        }
      }

      /** Referral marketing fields **/
      for (const referralPattern of referralMarketing) {
        const result = u.query.match(referralPattern)?.[1];

        if (!result) {
          u.query = "";
          break;
        }
      }
    }

    /** Clean fragments as well **/
    if (u.fragment) {
      for (const rulePattern of rules) {
        const result = u.fragment.match(rulePattern)?.[1];

        if (!result) {
          u.fragment = "";
          break;
        }
      }

      for (const referralPattern of referralMarketing) {
        const result = u.fragment.match(referralPattern)?.[1];

        if (!result) {
          u.fragment = "";
          break;
        }
      }
    }

    /** Clean unneeded path, especially Amazon.com **/
    if (rawRules) {
      if (u.pathname) {
        for (const rawRulePattern of rawRules) {
          const result = rawRulePattern.test(u.pathname);

          if (result) {
            u.pathname = u.pathname.replace(rawRulePattern, "");
          }
        }
      }
    }

    u = new CleanUrl(u.getUrl());

    return u.getUrl();
  }
}
