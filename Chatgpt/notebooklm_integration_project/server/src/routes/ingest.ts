import { Router } from 'express';
export const router = Router();
router.post('/', async (_req, res) => {
  res.json({ ok: true, message: 'Ingest pipeline stub. Replace with parser + embeddings.' });
});
