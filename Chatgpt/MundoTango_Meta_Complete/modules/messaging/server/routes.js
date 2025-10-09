import { Router } from 'express'
import { ensureAuth } from './middleware.js'
import { fbWebhook, igWebhook } from './webhooks.js'
const r = Router()
r.post('/webhooks/facebook', fbWebhook)
r.post('/webhooks/instagram', igWebhook)
export default r
