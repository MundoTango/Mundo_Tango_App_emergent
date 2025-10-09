import { Router } from 'express'
import { ensureAuth } from './middleware.js'
import { createPost, listLogs } from './controllers.js'
const r = Router()
r.post('/publish', ensureAuth, createPost)
r.get('/publish/logs', ensureAuth, listLogs)
export default r
