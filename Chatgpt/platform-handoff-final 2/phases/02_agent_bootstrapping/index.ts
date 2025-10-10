import { makeCtx } from "../../common/runtime.js";
export async function handle(input:any){
  const ctx=await makeCtx("phase_02"); const { supabase, log }=ctx;
  const a=input?.action||"run_task"; if(a!=="run_task") return { status:"ok" };
  const { phase, task }=input; log("task:start",{ phase, task });
  const u=await supabase.from("phase_tasks").update({ status:"running", updated_at:new Date().toISOString() }).match({ phase, task });
  if(u.error) return { status:"fail", error: { code:"db_error", message:u.error.message } };
  const d=await supabase.from("phase_tasks").update({ status:"done", updated_at:new Date().toISOString() }).match({ phase, task });
  if(d.error) return { status:"fail", error: { code:"db_error", message:d.error.message } };
  await supabase.from("phase_events").insert({ phase, event:"task.completed", payload:{ task } });
  return { status:"ok", data:{ phase, task, state:"done" } };
}