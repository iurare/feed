export const allowedShortUrl = [
  "amzn.to",
  "bit.ly",
  "buff.ly",
  "htn.to",
  "ift.tt",
  "link.medium.com",
  "news.google.com",
  "trib.al",
];

export const ignoredServices = [
  "facebook",
  "gigazine",
  "hatelabo",
  "hatena",
  "instagram",
  "paper",
  "reddit",
  "togetter",
  "twitter",
  "yahoo",
  "ycombinator",
  "youtube",
];

export const ignoredShortUrl = [
  "youtu.be",
];

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/ig, "\\$&");
}

export const allowedShortUrlPatterns = allowedShortUrl
  .map(escapeRegExp)
  .map((url) => new RegExp(`^https?:\\/\\/(?:[a-z0-9-]+\\.)*?${url}`));

const ignoredServicesPatterns = ignoredServices
  .map((service) =>
    new RegExp(
      `^https?:\\/\\/(?:[a-z0-9-]+\\.)*?${service}(?:\\.[a-z]{2,}){1,}`,
    )
  );
const ignoredShortUrlPatterns = ignoredShortUrl
  .map(escapeRegExp)
  .map((url) => new RegExp(`^https?:\\/\\/(?:[a-z0-9-]+\\.)*?${url}`));

export const ignoredDomainPatterns = [
  ...ignoredServicesPatterns,
  ...ignoredShortUrlPatterns,
];
