// supabase/functions/sync_event/index.ts
export const main = async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  console.log('sync_event body', body);
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" }});
};
