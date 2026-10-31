import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { undoManager } from '../undoManager.js';

export interface FileChoreItem {
  id: string;
  name: string;
  originalPath: string;
  size: number;
  sizeFormatted: string;
  extension: string;
  category: 'Screenshots' | 'Finances' | 'Documents' | 'Installers' | 'Media' | 'Images' | 'Developer' | 'Junk' | 'Other';
  suggestedFolder: string;
  isDuplicate: boolean;
  duplicateOf?: string;
  enemyType: 'ghost' | 'slime' | 'demon' | 'drone' | 'boss' | 'mimic';
  health: number;
  xp: number;
  icon: string;
  riskLevel: 'safe' | 'caution' | 'protected';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function computeFileHash(filePath: string): string {
  try {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch {
    return '';
  }
}

export class FolderJanitor {
  private currentDir: string = '';
  private items: Map<string, FileChoreItem> = new Map();

  scanDirectory(dirPath: string): { items: FileChoreItem[]; totalCount: number; totalSize: number } {
    this.currentDir = dirPath;
    this.items.clear();

    if (!fs.existsSync(dirPath)) {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }

    const files = fs.readdirSync(dirPath);
    const hashes = new Map<string, string>(); // hash -> filePath

    let totalSize = 0;
    const itemList: FileChoreItem[] = [];

    for (const file of files) {
      // Skip system or internal directories
      if (file === '.DS_Store' || file.startsWith('.') || file.startsWith('_ChoreQuest')) {
        continue;
      }

      const fullPath = path.join(dirPath, file);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        continue; // For safety, only process files in current root
      }

      totalSize += stat.size;
      const ext = path.extname(file).toLowerCase();
      const lowerName = file.toLowerCase();

      // Categorization rules
      let category: FileChoreItem['category'] = 'Other';
      let suggestedFolder = 'Miscellaneous';
      let enemyType: FileChoreItem['enemyType'] = 'slime';
      let icon = 'file';
      let riskLevel: FileChoreItem['riskLevel'] = 'safe';

      // 1. Junk / Temp logs
      if (['.tmp', '.log', '.crdownload', '.part', '.bak'].includes(ext) || lowerName.includes('temp') || lowerName.includes('cache')) {
        category = 'Junk';
        suggestedFolder = '_ChoreQuest_RecycleBin';
        enemyType = 'ghost';
        icon = 'trash';
      }
      // 2. Screenshots
      else if (lowerName.includes('screen shot') || lowerName.includes('screenshot') || (lowerName.startsWith('scr_') && ['.png', '.jpg'].includes(ext))) {
        category = 'Screenshots';
        suggestedFolder = 'Screenshots';
        enemyType = 'drone';
        icon = 'camera';
      }
      // 3. Financial receipts/invoices
      else if (['receipt', 'invoice', 'statement', 'bill', 'tax', 'w2', '1099', 'payroll', 'expense'].some(w => lowerName.includes(w))) {
        category = 'Finances';
        suggestedFolder = 'Finances_Receipts';
        enemyType = 'mimic';
        icon = 'dollar-sign';
        riskLevel = 'caution';
      }
      // 4. Installers & Archives
      else if (['.dmg', '.pkg', '.iso', '.exe', '.zip', '.tar', '.gz', '.tgz', '.rar', '.7z'].includes(ext)) {
        category = 'Installers';
        suggestedFolder = 'Archives_Installers';
        enemyType = 'demon';
        icon = 'archive';
      }
      // 5. Documents
      else if (['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.txt', '.rtf', '.pages', '.key', '.numbers'].includes(ext)) {
        category = 'Documents';
        suggestedFolder = 'Documents';
        enemyType = 'slime';
        icon = 'file-text';
      }
      // 6. Media
      else if (['.mp4', '.mov', '.mkv', '.avi', '.mp3', '.wav', '.m4a', '.flac', '.webm'].includes(ext)) {
        category = 'Media';
        suggestedFolder = 'Media_AudioVideo';
        enemyType = 'drone';
        icon = 'film';
      }
      // 7. Images
      else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.heic', '.bmp'].includes(ext)) {
        category = 'Images';
        suggestedFolder = 'Images';
        enemyType = 'slime';
        icon = 'image';
      }
      // 8. Developer scripts
      else if (['.json', '.sql', '.py', '.ts', '.js', '.sh', '.html', '.css', '.env.example', '.md'].includes(ext)) {
        category = 'Developer';
        suggestedFolder = 'Developer_Scripts';
        enemyType = 'drone';
        icon = 'code';
      }

      // Check protection (don't allow trashing important system files)
      if (['.env', 'id_rsa', 'master.key', 'credentials.json'].includes(lowerName)) {
        riskLevel = 'protected';
      }

      // Duplicate detection
      let isDuplicate = false;
      let duplicateOf: string | undefined = undefined;

      // Duplicate by copy naming: "file (1).pdf" or "file copy.pdf"
      const copyPattern = /\s*(\(\d+\)|copy)\./i;
      if (copyPattern.test(file)) {
        isDuplicate = true;
      } else if (stat.size > 0 && stat.size < 100 * 1024 * 1024) { // Only hash files under 100MB
        const hash = computeFileHash(fullPath);
        if (hash) {
          if (hashes.has(hash)) {
            isDuplicate = true;
            duplicateOf = hashes.get(hash);
          } else {
            hashes.set(hash, fullPath);
          }
        }
      }

      const id = 'f_' + crypto.randomUUID().slice(0, 8);
      const xp = isDuplicate ? 250 : stat.size > 10 * 1024 * 1024 ? 300 : 100;
      const health = stat.size > 50 * 1024 * 1024 ? 300 : stat.size > 5 * 1024 * 1024 ? 150 : 100;

      if (stat.size > 100 * 1024 * 1024) {
        enemyType = 'boss';
      }

      const item: FileChoreItem = {
        id,
        name: file,
        originalPath: fullPath,
        size: stat.size,
        sizeFormatted: formatBytes(stat.size),
        extension: ext,
        category,
        suggestedFolder,
        isDuplicate,
        duplicateOf,
        enemyType,
        health,
        xp,
        icon,
        riskLevel
      };

      this.items.set(id, item);
      itemList.push(item);
    }

    return {
      items: itemList,
      totalCount: itemList.length,
      totalSize
    };
  }

  getItem(id: string): FileChoreItem | undefined {
    return this.items.get(id);
  }

  executeAction(id: string, action: 'sort' | 'recycle' | 'keep' | 'dedup', dryRun: boolean): {
    success: boolean;
    summary: string;
    action: string;
    newPath?: string;
    xpGained: number;
  } {
    const item = this.items.get(id);
    if (!item) {
      return { success: false, summary: 'Item not found in current session', action, xpGained: 0 };
    }

    if (item.riskLevel === 'protected') {
      return { success: false, summary: `Protected file: ${item.name} cannot be moved or deleted!`, action, xpGained: 0 };
    }

    if (action === 'keep') {
      this.items.delete(id);
      return { success: true, summary: `Kept ${item.name} in place`, action, xpGained: 50 };
    }

    let targetDirName = item.suggestedFolder;
    if (action === 'recycle' || action === 'dedup') {
      targetDirName = '_ChoreQuest_RecycleBin';
    }

    const destinationDir = path.join(this.currentDir, targetDirName);
    const destinationPath = path.join(destinationDir, item.name);

    if (dryRun) {
      this.items.delete(id);
      return {
        success: true,
        summary: `[DRY-RUN] Would move ${item.name} -> /${targetDirName}/`,
        action,
        newPath: destinationPath,
        xpGained: item.xp
      };
    }

    try {
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
      }

      // Handle file collision if destination file already exists
      let finalDestPath = destinationPath;
      if (fs.existsSync(finalDestPath)) {
        const ext = path.extname(item.name);
        const base = path.basename(item.name, ext);
        finalDestPath = path.join(destinationDir, `${base}_${Date.now()}${ext}`);
      }

      fs.renameSync(item.originalPath, finalDestPath);

      // Record in undo manager
      undoManager.record({
        id: crypto.randomUUID(),
        choreType: 'folder',
        timestamp: Date.now(),
        summary: `Moved ${item.name} to /${targetDirName}/`,
        revertType: 'move_file',
        revertData: {
          fromPath: item.originalPath,
          toPath: finalDestPath
        }
      });

      this.items.delete(id);

      return {
        success: true,
        summary: `Filed ${item.name} -> /${targetDirName}/ (${item.sizeFormatted})`,
        action,
        newPath: finalDestPath,
        xpGained: item.xp
      };
    } catch (err: any) {
      return {
        success: false,
        summary: `Failed to move ${item.name}: ${err.message}`,
        action,
        xpGained: 0
      };
    }
  }

  getCurrentDir(): string {
    return this.currentDir;
  }
}

export const folderJanitor = new FolderJanitor();
