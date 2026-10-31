import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { undoManager } from '../undoManager.js';

export interface CodeIssueItem {
  id: string;
  filePath: string;
  fileName: string;
  relativePath: string;
  line: number;
  issueType: 'console_log' | 'trailing_whitespace' | 'double_semicolon' | 'excessive_blank_lines' | 'dangling_todo' | 'tab_indent';
  description: string;
  originalSnippet: string;
  fixedSnippet: string;
  health: number;
  xp: number;
  enemyType: 'bug' | 'glitch' | 'worm' | 'parasite';
}

export class CodeLinter {
  private currentDir: string = '';
  private issues: Map<string, CodeIssueItem> = new Map();

  scanCodebase(dirPath: string): { issues: CodeIssueItem[]; totalFiles: number; totalIssues: number } {
    this.currentDir = dirPath;
    this.issues.clear();

    if (!fs.existsSync(dirPath)) {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }

    const issueList: CodeIssueItem[] = [];
    let fileCount = 0;

    const walk = (current: string) => {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || ['node_modules', 'dist', 'build', '.git', 'coverage'].includes(entry.name)) {
          continue;
        }

        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.js', '.jsx', '.ts', '.tsx', '.py', '.css', '.html', '.json', '.md'].includes(ext)) {
            fileCount++;
            this.scanFile(fullPath, issueList);
          }
        }
      }
    };

    walk(dirPath);

    return {
      issues: issueList,
      totalFiles: fileCount,
      totalIssues: issueList.length
    };
  }

  private scanFile(filePath: string, issueList: CodeIssueItem[]) {
    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      return;
    }

    const lines = content.split('\n');
    const fileName = path.basename(filePath);
    const relPath = path.relative(this.currentDir, filePath);

    let consecutiveBlanks = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // 1. Console.log / print statements
      if (/console\.(log|debug|warn|info)\s*\(.*?\);?/i.test(line)) {
        const id = 'c_' + crypto.randomUUID().slice(0, 8);
        const item: CodeIssueItem = {
          id,
          filePath,
          fileName,
          relativePath: relPath,
          line: lineNum,
          issueType: 'console_log',
          description: `Dangling console.log statement on line ${lineNum}`,
          originalSnippet: line.trim(),
          fixedSnippet: '// [CLEANED BY CHOREQUEST]',
          health: 120,
          xp: 200,
          enemyType: 'bug'
        };
        this.issues.set(id, item);
        issueList.push(item);
      }

      // 2. Trailing whitespace
      if (/[ \t]+$/.test(line)) {
        const id = 'c_' + crypto.randomUUID().slice(0, 8);
        const item: CodeIssueItem = {
          id,
          filePath,
          fileName,
          relativePath: relPath,
          line: lineNum,
          issueType: 'trailing_whitespace',
          description: `Trailing whitespace on line ${lineNum}`,
          originalSnippet: line,
          fixedSnippet: line.replace(/[ \t]+$/, ''),
          health: 80,
          xp: 150,
          enemyType: 'glitch'
        };
        this.issues.set(id, item);
        issueList.push(item);
      }

      // 3. Double semicolons
      if (/;{2,}/.test(line)) {
        const id = 'c_' + crypto.randomUUID().slice(0, 8);
        const item: CodeIssueItem = {
          id,
          filePath,
          fileName,
          relativePath: relPath,
          line: lineNum,
          issueType: 'double_semicolon',
          description: `Double semicolon on line ${lineNum}`,
          originalSnippet: line.trim(),
          fixedSnippet: line.replace(/;{2,}/g, ';').trim(),
          health: 100,
          xp: 175,
          enemyType: 'worm'
        };
        this.issues.set(id, item);
        issueList.push(item);
      }

      // 4. Excessive blank lines
      if (line.trim() === '') {
        consecutiveBlanks++;
        if (consecutiveBlanks === 3) {
          const id = 'c_' + crypto.randomUUID().slice(0, 8);
          const item: CodeIssueItem = {
            id,
            filePath,
            fileName,
            relativePath: relPath,
            line: lineNum,
            issueType: 'excessive_blank_lines',
            description: `Excessive empty lines around line ${lineNum}`,
            originalSnippet: '[3+ empty lines]',
            fixedSnippet: '[single newline]',
            health: 90,
            xp: 120,
            enemyType: 'parasite'
          };
          this.issues.set(id, item);
          issueList.push(item);
        }
      } else {
        consecutiveBlanks = 0;
      }
    }
  }

  executeFix(id: string, dryRun: boolean): {
    success: boolean;
    summary: string;
    filePath?: string;
    xpGained: number;
    diff?: { before: string; after: string; line: number };
  } {
    const issue = this.issues.get(id);
    if (!issue) {
      return { success: false, summary: 'Code issue not found', xpGained: 0 };
    }

    if (dryRun) {
      this.issues.delete(id);
      return {
        success: true,
        summary: `[DRY-RUN] Would fix ${issue.issueType} in ${issue.fileName}:${issue.line}`,
        filePath: issue.filePath,
        xpGained: issue.xp,
        diff: { before: issue.originalSnippet, after: issue.fixedSnippet, line: issue.line }
      };
    }

    try {
      const originalContent = fs.readFileSync(issue.filePath, 'utf-8');
      const lines = originalContent.split('\n');
      const targetIndex = issue.line - 1;

      if (targetIndex >= lines.length) {
        return { success: false, summary: 'Line no longer exists in file', xpGained: 0 };
      }

      const targetLine = lines[targetIndex];

      // Apply fix based on issue type
      if (issue.issueType === 'console_log') {
        // Remove or comment out line
        lines.splice(targetIndex, 1);
      } else if (issue.issueType === 'trailing_whitespace') {
        lines[targetIndex] = targetLine.replace(/[ \t]+$/, '');
      } else if (issue.issueType === 'double_semicolon') {
        lines[targetIndex] = targetLine.replace(/;{2,}/g, ';');
      } else if (issue.issueType === 'excessive_blank_lines') {
        // Remove extra empty line
        lines.splice(targetIndex, 1);
      }

      const updatedContent = lines.join('\n');

      // Record in undo manager
      undoManager.record({
        id: crypto.randomUUID(),
        choreType: 'code',
        timestamp: Date.now(),
        summary: `Fixed ${issue.issueType} in ${issue.fileName}:${issue.line}`,
        revertType: 'restore_file_content',
        revertData: {
          filePath: issue.filePath,
          originalContent
        }
      });

      fs.writeFileSync(issue.filePath, updatedContent, 'utf-8');
      this.issues.delete(id);

      return {
        success: true,
        summary: `Patched ${issue.issueType.replace('_', ' ')} in ${issue.fileName} (L${issue.line})`,
        filePath: issue.filePath,
        xpGained: issue.xp,
        diff: { before: issue.originalSnippet, after: issue.fixedSnippet, line: issue.line }
      };
    } catch (err: any) {
      return {
        success: false,
        summary: `Failed to fix code: ${err.message}`,
        xpGained: 0
      };
    }
  }

  getCurrentDir(): string {
    return this.currentDir;
  }
}

export const codeLinter = new CodeLinter();
