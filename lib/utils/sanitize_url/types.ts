export interface RuleSets {
  providers: Provider;
}

export interface Provider {
  [providerName: string]: Rule;
}

export interface Rule {
  urlPattern: string;
  completeProvider: boolean;
  rules: string[];
  referralMarketing: string[];
  exceptions: string[];
  rawRules: string[];
  redirections: string[];
  forceRedirection: boolean;
}

export interface Pattern {
  providerName: string;
  urlPattern: RegExp;
  completeProvider: boolean;
  rules: RegExp[];
  referralMarketing: RegExp[];
  exceptions: RegExp[];
  rawRules: RegExp[];
  redirections: RegExp[];
  forceRedirection: boolean;
}
