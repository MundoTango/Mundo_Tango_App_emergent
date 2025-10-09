import { fetchPageEvents, createOfficialFbEvent } from '../utils/fbIntegration.js'
import { supabase } from '../utils/supabaseClient.js'
export async function importFbEvents(req, res){ res.json({ imported: [] }) }
export async function publishToFb(req, res){ res.status(403).json({ error: 'FB official events publishing not enabled' }) }
export async function syncFbEvent(req, res){ res.json({ updatedFields: {}, is_canceled: false }) }
export async function getFbCapability(req, res){ res.json({ canPublishEvents: process.env.FB_OFFICIAL_EVENTS_ENABLED === 'true' }) }
