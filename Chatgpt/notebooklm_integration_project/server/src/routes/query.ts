import { Router } from 'express';
export const router = Router();
router.post('/', async (req, res) => {
  const { question } = req.body || {};
  res.json({ ok: true, question, answer: 'Stub: implement retrieval + Gemini completion with citations.' });
});
