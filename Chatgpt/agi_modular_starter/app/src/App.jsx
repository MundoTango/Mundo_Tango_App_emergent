import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
export default function App(){
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [logs, setLogs] = useState([]);
  useEffect(()=>{
    fetchJobs();
    const ch = supabase.channel('jobs-feed')
      .on('postgres_changes', { event:'*', schema:'public', table:'jobs' }, fetchJobs)
      .subscribe();
    return ()=> supabase.removeChannel(ch);
  },[]);
  async function fetchJobs(){
    const { data } = await supabase.from('jobs').select('*').order('scheduled_at', { ascending:false }).limit(100);
    setJobs(data || []);
  }
  async function fetchLogs(id){
    const { data } = await supabase.from('module_logs').select('*').eq('job_id', id).order('ts', { ascending:false }).limit(100);
    setLogs(data || []);
  }
  async function retry(id){
    await supabase.from('jobs').update({ status:'queued', attempts:0, error_text:null, scheduled_at:new Date().toISOString() }).eq('id', id);
    await fetchJobs();
  }
  return (<div style={{fontFamily:'sans-serif', padding:20}}>
    <h1>Mundo Tango — Jobs</h1>
    <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
      <div>
        <table width="100%" border="1" cellPadding="6">
          <thead><tr><th>ID</th><th>Type</th><th>Status</th><th>Priority</th><th>Attempts</th><th>Scheduled</th><th>Actions</th></tr></thead>
          <tbody>
            {(jobs||[]).map(j=>(
              <tr key={j.id} onClick={()=>{setSelected(j); fetchLogs(j.id);}} style={{cursor:'pointer', background:selected?.id===j.id?'#eef':''}}>
                <td>{j.id}</td><td>{j.job_type}</td><td>{j.status}</td><td>{j.priority}</td>
                <td>{j.attempts}/{j.max_attempts}</td><td>{new Date(j.scheduled_at).toLocaleString()}</td>
                <td><button onClick={(e)=>{e.stopPropagation(); retry(j.id);}}>Retry</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2>Logs {selected?`for #${selected.id}`:''}</h2>
        <ul style={{maxHeight:'70vh', overflow:'auto'}}>
          {(logs||[]).map(l=>(<li key={l.id}><b>[{l.level}]</b> {new Date(l.ts).toLocaleTimeString()} — <i>{l.module}</i>: {l.msg}</li>))}
        </ul>
      </div>
    </div>
  </div>);
}
