import { Router } from 'express';
export const router = Router();
router.get('/status', (req, res) => res.json({ ok: true, auth: 'google-oauth-stub' }));
