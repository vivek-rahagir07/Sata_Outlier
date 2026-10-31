import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

export function isSafePath(targetPath: string): boolean {
  if (!targetPath || typeof targetPath !== 'string') return false;
  // Reject null byte injection
  if (targetPath.indexOf('\0') !== -1) return false;
  const resolved = path.resolve(targetPath);
  return ALLOWED_ROOTS.some(root => resolved.startsWith(root));
}

// 1. Helmet Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Managed by client frontend
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// 2. Rate Limiting to Prevent Brute-force & Denial of Service
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this client, please try again later.' }
});

app.use('/api/', apiLimiter);

// 3. CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://vivek-rahagir07.github.io'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 4. Strict Body Parsing & Payload Limit
app.use(express.json({ limit: '512kb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'Sata Chore Engine Backend',
    version: '2.4.0',
    security: {
      rateLimiter: 'active',
      helmet: 'active',
      pathTraversalGuards: 'active'
    }
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
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
      return res.status(400).json({ error: 'Missing or invalid issue ID format' });
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
  if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid record ID format' });
  }
  const result = undoManager.undoRecord(id);
  res.json(result);
});

app.post('/api/undo/all', (req: Request, res: Response) => {
  const result = undoManager.undoAll();
  res.json(result);
});

// Global Error Handler (Prevents stack trace leaks in production)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Security Alert - Handled Server Exception]:', err.message);
  res.status(err.status || 500).json({
    error: 'An internal server error occurred. Request details withheld for security.'
  });
});

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Sata Chore Engine] Server running securely on http://localhost:${PORT}`);
  });
}

export { app };
