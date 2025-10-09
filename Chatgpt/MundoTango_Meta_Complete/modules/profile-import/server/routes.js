import { Router } from 'express'
import { ensureAuth } from './middleware.js'
import { uploadExport, parseExport } from './controllers.js'
const r = Router()
r.post('/import/upload', ensureAuth, uploadExport)
r.post('/import/parse', ensureAuth, parseExport)
export default r
