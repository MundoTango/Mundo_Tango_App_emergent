import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const params = new URLSearchParams({
    client_id: process.env.FB_APP_ID!,
    redirect_uri: process.env.FB_REDIRECT_URI!,
    scope: "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_events",
    response_type: "code"
  });
  res.redirect(`https://www.facebook.com/${process.env.FB_GRAPH_VERSION || "v19.0"}/dialog/oauth?${params}`);
}
