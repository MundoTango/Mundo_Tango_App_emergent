import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { job_type, payload, priority = 5, run_at = null } = await req.json();
    if (!job_type || !payload) {
      return new Response(JSON.stringify({ ok:false, error:"Missing job_type or payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type":"application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase.from("jobs")
      .insert({ job_type, payload, priority, scheduled_at: run_at ?? new Date().toISOString() })
      .select("id").single();
    if (error) throw error;
    return new Response(JSON.stringify({ ok:true, job_id:data.id }), { headers: { ...corsHeaders, "Content-Type":"application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status:500, headers: { ...corsHeaders, "Content-Type":"application/json" } });
  }
});