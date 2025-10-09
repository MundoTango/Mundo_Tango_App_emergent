import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const VERIFY = process.env.FB_WEBHOOK_VERIFY_TOKEN!;

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY) return res.status(200).send(challenge);
    return res.status(403).send("Forbidden");
  }

  if (req.method === "POST") {
    // TODO: verify signature; enqueue sync job; call internal API.
    console.log("FB Webhook event", JSON.stringify(req.body));
    return res.status(200).json({ received: true });
  }

  res.status(405).end();
}
