export async function request(
  url: string,
  { token, isRedirect }: { token?: string; isRedirect?: boolean } = {},
): Promise<Response> {
  const initOptions: RequestInit = {
    keepalive: true,
    referrerPolicy: "no-referrer",
  };

  if (isRedirect) {
    const redirect: RequestRedirect = "manual";
    return await fetch(url, { ...initOptions, redirect });
  } else if (token) {
    return await fetch(url, {
      ...initOptions,
      headers: { Authorization: `Bearer ${token}` },
    });
  } else {
    return await fetch(url, initOptions);
  }
}
