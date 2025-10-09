import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { router as auth } from './routes/auth.js';
import { router as sources } from './routes/sources.js';
import { router as ingest } from './routes/ingest.js';
import { router as query } from './routes/query.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });

app.use('/api/auth', auth);
app.use('/api/sources', sources);
app.use('/api/ingest', upload.single('file'), ingest);
app.use('/api/query', query);

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`[server] listening on :${port}`));
