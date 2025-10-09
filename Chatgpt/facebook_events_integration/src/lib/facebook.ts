const BASE = `https://graph.facebook.com/${process.env.FB_GRAPH_VERSION || "v19.0"}`;

export async function exchangeToken(code: string, redirectUri: string) {
  const url = new URL(`${BASE}/oauth/access_token`);
  url.searchParams.set("client_id", process.env.FB_APP_ID!);
  url.searchParams.set("client_secret", process.env.FB_APP_SECRET!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json();
}

export async function getPages(accessToken: string) {
  const url = `${BASE}/me/accounts?fields=id,name,access_token,perms`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Pages fetch failed: ${res.status}`);
  return res.json();
}

export async function getPageEvents(pageId: string, accessToken: string) {
  const fields = "id,name,start_time,end_time,place,description,cover,is_canceled,ticket_uri,updated_time";
  const url = `${BASE}/${pageId}/events?fields=${fields}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);
  return res.json();
}

export async function getEventDetails(eventId: string, accessToken: string) {
  const fields = "id,name,place,description,cover,start_time,end_time,is_canceled,ticket_uri,updated_time";
  const url = `${BASE}/${eventId}?fields=${fields}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Event fetch failed: ${res.status}`);
  return res.json();
}
