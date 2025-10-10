import { claimJob, completeJob, failJob } from "../common/queue.js";
import { createClient } from "@supabase/supabase-js";
import { handle as facebook_events } from "../extensions/facebook_events/index.js";
import { handle as stripe_mercury } from "../extensions/stripe_mercury/index.js";
import { handle as helpbot } from "../extensions/helpbot/index.js";
import { handle as travel_memory } from "../extensions/travel_memory/index.js";
import { handle as organizer_dashboards } from "../extensions/organizer_dashboards/index.js";
import { handle as voice_media_agents } from "../extensions/voice_media_agents/index.js";
import { handle as esa_runtime } from "../extensions/esa_runtime/index.js";
import { handle as phase_01 } from "../phases/01_foundation_setup/index.js";
import { handle as phase_02 } from "../phases/02_agent_bootstrapping/index.js";
import { handle as phase_03 } from "../phases/03_data_schema_integration/index.js";
import { handle as phase_04 } from "../phases/04_api_workflow_orchestration/index.js";
import { handle as phase_05 } from "../phases/05_ui_ux_integration/index.js";
import { handle as phase_06 } from "../phases/06_security_architecture/index.js";
import { handle as phase_07 } from "../phases/07_security_ux_integration/index.js";
import { handle as phase_08 } from "../phases/08_runtime_worker_orchestration/index.js";
import { handle as phase_09 } from "../phases/09_ai_feature_integration/index.js";
import { handle as phase_10 } from "../phases/10_observability_analytics/index.js";
import { handle as phase_11 } from "../phases/11_notifications_feedback_loops/index.js";
import { handle as phase_12 } from "../phases/12_admin_data_ops/index.js";
import { handle as phase_13 } from "../phases/13_ai_reasoning_knowledge_graph/index.js";
import { handle as phase_14 } from "../phases/14_ci_cd_automation_versioning/index.js";
import { handle as phase_15 } from "../phases/15_documentation_contributor_ecosystem/index.js";
import { handle as phase_16 } from "../phases/16_global_deployment_scaling/index.js";
import { handle as phase_17 } from "../phases/17_investor_community_launch/index.js";
import { handle as phase_18 } from "../phases/18_cross_community_expansion/index.js";
import { handle as phase_19 } from "../phases/19_ai_governance_ethics/index.js";
import { handle as phase_20 } from "../phases/20_decentralized_infrastructure/index.js";
import { handle as phase_21 } from "../phases/21_esa_life_ceo_integration/index.js";

const handlers: Record<string, (payload:any)=>Promise<any>> = {
  "phase_01": phase_01,
  "phase_02": phase_02,
  "phase_03": phase_03,
  "phase_04": phase_04,
  "phase_05": phase_05,
  "phase_06": phase_06,
  "phase_07": phase_07,
  "phase_08": phase_08,
  "phase_09": phase_09,
  "phase_10": phase_10,
  "phase_11": phase_11,
  "phase_12": phase_12,
  "phase_13": phase_13,
  "phase_14": phase_14,
  "phase_15": phase_15,
  "phase_16": phase_16,
  "phase_17": phase_17,
  "phase_18": phase_18,
  "phase_19": phase_19,
  "phase_20": phase_20,
  "phase_21": phase_21,

  facebook_events,
  stripe_mercury,
  helpbot,
  travel_memory,
  organizer_dashboards,
  voice_media_agents,
  esa_runtime,
};

async function emitEvent(channel:string, payload:any){
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await sb.from("events_bus").insert({ channel, payload });
}

async function loop(){
  while(true){
    try{
      const job = await claimJob();
      if(!job){ await new Promise(r=>setTimeout(r,800)); continue; }
      const fn = handlers[job.agent];
      if(!fn){ console.warn("No handler for", job.agent); await failJob(job.id, false); continue; }
      const res = await fn(job.payload);
      if(res?.status==="ok"){ await completeJob(job.id); await emitEvent(`jobs.${job.agent}.completed`, { job_id: job.id, result: res?.data }); }
      else { await failJob(job.id, true); }
    }catch(e:any){ console.error("worker error", e?.message||e); await new Promise(r=>setTimeout(r,1000)); }
  }
}

function subscribeRealtime(){
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  sb.channel('events_bus_rt').on('postgres_changes',{event:'INSERT',schema:'public',table:'events_bus'}, (p)=>{
    console.log("[realtime]", p.new?.channel, p.new?.payload);
  }).subscribe();
}

subscribeRealtime();
loop();
