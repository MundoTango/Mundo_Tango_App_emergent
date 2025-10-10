import Fastify from "fastify";
import { makeCtx } from "../common/runtime.js";
import { authGuard, requireRole } from "./middleware/auth.js";
import { enqueueJob } from "../common/queue.js";
import { handle as facebookEvents } from "../extensions/facebook_events/index.js";
import { handle as payments, webhook as paymentsWebhook } from "../extensions/stripe_mercury/index.js";
import { handle as helpbot } from "../extensions/helpbot/index.js";
import { handle as travel } from "../extensions/travel_memory/index.js";
import { handle as organizer } from "../extensions/organizer_dashboards/index.js";
import { handle as media } from "../extensions/voice_media_agents/index.js";
import { handle as runtime } from "../extensions/esa_runtime/index.js";
import { startAllPhases, statusSummary } from "./phase-coordinator.js";

const app = Fastify();
app.get("/health", async () => ({ ok: true }));

// demo app placeholder
app.get("/app", async () => `<!doctype html><html><head><meta charset="utf-8"><title>Mundo Tango App</title></head><body style="font-family:system-ui;padding:24px"><h1>Mundo Tango — Feature Demo</h1></body></html>`);

// Events
app.post("/api/facebook/import", { preHandler: authGuard }, async (req, res) => { const body:any = await req.body; const job = await enqueueJob("facebook_events", { action: "import", fb_event_payload: body }); return res.send({ status: "queued", job }); });
app.get("/api/events/list", { preHandler: authGuard }, async (req, res) => res.send(await facebookEvents({ action: "list" })) );

// Payments
app.post("/api/payments/checkout", { preHandler: authGuard }, async (req, res) => res.send(await payments(await req.body)) );
app.post("/api/payments/webhook", async (req, res) => { const body:any = await req.body; return res.send(await paymentsWebhook(body)); });

// Organizer
app.post("/api/organizer/dashboard", { preHandler: [authGuard, requireRole(["organizer","admin"])] }, async (req, res) => res.send(await organizer({ action: "summary" })) );
app.post("/api/organizer/volunteers/add", { preHandler: [authGuard, requireRole(["organizer","admin"])] }, async (req, res) => res.send(await organizer({ action: "add_volunteer", ...(await req.body) })) );

// Help, Travel, Media, Runtime
app.post("/api/help/query", { preHandler: authGuard }, async (req, res) => res.send(await helpbot(await req.body)) );
app.post("/api/travel/sync", { preHandler: authGuard }, async (req, res) => res.send(await travel(await req.body)) );
app.post("/api/media/voice", { preHandler: authGuard }, async (req, res) => res.send(await media(await req.body)) );
app.post("/api/media/video", { preHandler: authGuard }, async (req, res) => res.send(await media(await req.body)) );
app.post("/api/esa/run", { preHandler: authGuard }, async (req, res) => res.send(await runtime(await req.body)) );

// Phases control
app.post("/api/esa/phases/start", { preHandler: [authGuard, requireRole(["admin"])] }, async (req, res) => res.send(await startAllPhases()) );
app.get("/api/esa/phases/status", { preHandler: [authGuard, requireRole(["admin","organizer"])] }, async (req, res) => res.send(await statusSummary()) );

// OpenAPI serve
app.get("/docs/openapi.yaml", async (req, res) => { const fs = await import("node:fs/promises"); const data = await fs.readFile("./openapi.yaml","utf-8"); res.header("content-type","application/yaml").send(data); });

app.listen({ port: 3000, host: "0.0.0.0" }).then(()=>console.log("Server on :3000"));
