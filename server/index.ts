import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { codeLinter } from './choreEngines/codeLinter.js';
import { folderJanitor } from './choreEngines/folderJanitor.js';
import { emailTriage } from './choreEngines/emailTriage.js';
import { undoManager } from './undoManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed directories for safe sandbox execution (prevents path traversal)
const ALLOWED_ROOTS = [
  path.resolve(process.cwd()),
  path.resolve(process.cwd(), 'chaos_sandbox'),
];

function isSafePath(targetPath: string): boolean {
  const resolved = path.resolve(targetPath);
  return ALLOWED_ROOTS.some(root => resolved.startsWith(root));
}

// Security Middlewares
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'Sata Chore Engine Backend',
    version: '2.4.0'
  });
});

// Linter Endpoints
app.post('/api/lint/scan', (req: Request, res: Response) => {
  try {
    const dir = req.body?.dirPath || process.cwd();
    if (!isSafePath(dir)) {
      return res.status(403).json({ error: 'Access denied: Directory outside allowed sandbox' });
    }
    const result = codeLinter.scanCodebase(dir);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Linter scan failed' });
  }
});

app.post('/api/lint/fix', (req: Request, res: Response) => {
  try {
    const { id, dryRun = false } = req.body || {};
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid issue ID' });
    }
    const result = codeLinter.executeFix(id, Boolean(dryRun));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Fix execution failed' });
  }
});

// Folder Janitor Endpoints
app.post('/api/folder/scan', (req: Request, res: Response) => {
  try {
    const dir = req.body?.dirPath || path.join(process.cwd(), 'chaos_sandbox');
    if (!isSafePath(dir)) {
      return res.status(403).json({ error: 'Access denied: Directory outside allowed sandbox' });
    }
    const result = folderJanitor.scanDirectory(dir);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Folder scan failed' });
  }
});

// Email Triage Endpoints
app.post('/api/email/scan', (req: Request, res: Response) => {
  try {
    const dir = req.body?.dirPath;
    if (dir && !isSafePath(dir)) {
      return res.status(403).json({ error: 'Access denied: Directory outside allowed sandbox' });
    }
    emailTriage.initialize(dir);
    const emails = emailTriage.getEmails();
    res.json({ emails, count: emails.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Email scan failed' });
  }
});

// Undo Journal Endpoints
app.get('/api/undo/history', (req: Request, res: Response) => {
  res.json({
    history: undoManager.getHistory(),
    count: undoManager.getHistoryCount()
  });
});

app.post('/api/undo/record/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const result = undoManager.undoRecord(id);
  res.json(result);
});

app.post('/api/undo/all', (req: Request, res: Response) => {
  const result = undoManager.undoAll();
  res.json(result);
});

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Sata Chore Engine] Server running securely on http://localhost:${PORT}`);
  });
}

export { app };
