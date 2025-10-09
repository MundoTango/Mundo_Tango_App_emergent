import { Router } from 'express'
import { ensureAuth } from './middleware.js'
import { importFbEvents, publishToFb, syncFbEvent, getFbCapability } from './controllers.js'
const r = Router()
r.get('/events/import/fb', ensureAuth, importFbEvents)
r.post('/events/:id/publish/fb', ensureAuth, publishToFb)
r.patch('/events/fb/:externalId/sync', ensureAuth, syncFbEvent)
r.get('/events/fb/capability', ensureAuth, getFbCapability)
export default r
