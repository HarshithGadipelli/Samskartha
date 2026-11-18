import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiRouter from './routes/api.js';

const app = express();
const port = Number(process.env.PORT || 8787);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: clientOrigin.split(',').map((item) => item.trim()), credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiRouter);

// Serve the built SPA when deployed as a single Node service.
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (error) => { if (error) next(); });
});

app.use((error, _req, res, _next) => {
  console.error('[Samskartha API]', error?.stack || error);
  if (error?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: `A file exceeds the ${process.env.MAX_UPLOAD_MB || 10} MB upload limit.` });
  if (error?.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: 'You can upload up to 5 files at a time.' });
  const status = error.status || 500;
  res.status(status).json({ error: status >= 500 ? (error.message || 'The server could not complete the request.') : error.message });
});

app.listen(port, () => console.log(`Samskartha API listening on http://localhost:${port}`));
