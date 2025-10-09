import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  // TODO: authenticate n8n via shared secret header
  // TODO: fetch FB delta and upsert to Supabase
  return res.status(200).json({ ok: true });
}
