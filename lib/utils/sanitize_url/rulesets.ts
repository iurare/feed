import { resolve } from "path";

import { Pattern, RuleSets } from "./types.ts";
import { CWD } from "../../constants.ts";

export const rulePath = resolve(CWD, "./lib/data/data.min.json");

export function readRuleFile(path: string): RuleSets {
  const data = Deno.readTextFileSync(path);
  return JSON.parse(data);
}

export function readRuleSets(data: RuleSets): Pattern[] {
  const ruleSets: Pattern[] = [];

  const { providers } = data;
  for (const providerName in providers) {
    const {
      urlPattern: UrlPattern,
      completeProvider: CompleteProvider,
      rules: TrackingPatterns,
      referralMarketing: ReferralMarketingPatterns,
      exceptions: ExceptionPatterns,
      rawRules: RawRulePatterns,
      redirections: RedirectionPatterns,
      forceRedirection: ForceRedirection,
    } = providers[providerName];

    const urlPattern = new RegExp(UrlPattern);
    const completeProvider = CompleteProvider || false;
    const forceRedirection = ForceRedirection || false;

    const rules: RegExp[] = [];
    for (const rule of TrackingPatterns) {
      rules.push(new RegExp(`(%(?:26|23)|&|^)${rule}(?:(?:=|%3[Dd])[^&]*)`));
    }

    const rawRules: RegExp[] = [];
    for (const rawRule of RawRulePatterns) {
      rawRules.push(new RegExp(rawRule));
    }

    const referralMarketing: RegExp[] = [];
    for (const referral of ReferralMarketingPatterns) {
      referralMarketing.push(
        new RegExp(`(%(?:26|23)|&|^)${referral}(?:(?:=|%3[Dd])[^&]*)`),
      );
    }
    const exceptions: RegExp[] = [];
    for (const exception of ExceptionPatterns) {
      exceptions.push(new RegExp(exception));
    }

    const redirections: RegExp[] = [];
    for (const redirection of RedirectionPatterns) {
      redirections.push(new RegExp(`${redirection}.*`));
    }

    ruleSets.push({
      providerName,
      urlPattern,
      completeProvider,
      rules,
      rawRules,
      referralMarketing,
      exceptions,
      redirections,
      forceRedirection,
    });
  }

  return ruleSets;
}
