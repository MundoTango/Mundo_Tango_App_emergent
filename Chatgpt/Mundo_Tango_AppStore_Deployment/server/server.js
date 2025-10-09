import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

app.get('/health', (_req, res) => res.json({ ok: true, service: 'mundo-tango-server' }));

// Example protected route stub
app.post('/feedback', async (req, res) => {
  const { message, user_id } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Missing message' });
  const { error } = await supabase.from('feedback').insert({ message, user_id });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on :${port}`));