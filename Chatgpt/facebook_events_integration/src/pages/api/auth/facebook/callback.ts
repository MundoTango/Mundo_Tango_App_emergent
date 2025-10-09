import type { NextApiRequest, NextApiResponse } from "next";
import { exchangeToken, getPages } from "@/lib/facebook";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") return res.status(400).json({ error: "Missing code" });
    const redirectUri = process.env.FB_REDIRECT_URI!;
    const tokenData = await exchangeToken(code, redirectUri);
    // TODO: Securely store token in Supabase using service role or Edge Function.
    const pages = await getPages(tokenData.access_token);
    res.status(200).json({ ok: true, token: { ...tokenData, access_token: "***" }, pages });
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
}
