import * as Sentry from "@sentry/node";import { PostHog } from "posthog-node";
let inited=false; let ph:PostHog|null=null;
export function initObservability(){ if(!inited && process.env.SENTRY_DSN){ Sentry.init({dsn:process.env.SENTRY_DSN}); inited=true;} if(!ph && process.env.POSTHOG_KEY){ ph=new PostHog(process.env.POSTHOG_KEY,{host:process.env.POSTHOG_HOST||"https://app.posthog.com"});}}
export function logEvent(e:string,props:any={}){ if(ph) ph.capture({distinctId:"system",event:e,properties:props}); if(process.env.NODE_ENV!=="production") console.log("[event]",e,props);}
export function logError(err:any,ctx?:any){ if(inited) Sentry.captureException(err,{extra:ctx}); console.error("[error]",err?.message||err,ctx||{});}