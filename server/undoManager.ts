import fs from 'fs';
import path from 'path';

export interface UndoRecord {
  id: string;
  choreType: 'folder' | 'code' | 'email' | 'expense';
  timestamp: number;
  summary: string;
  details?: Record<string, any>;
  revertType: 'move_file' | 'restore_file_content' | 'restore_email' | 'restore_expense';
  revertData: {
    fromPath?: string;
    toPath?: string;
    filePath?: string;
    originalContent?: string;
    emailId?: string;
    previousState?: any;
    expenseId?: string;
    previousCategory?: string;
  };
}

class UndoManager {
  private history: UndoRecord[] = [];
  private maxHistory = 1000;

  record(record: UndoRecord) {
    this.history.unshift(record);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }
  }

  getHistory(): UndoRecord[] {
    return [...this.history];
  }

  getHistoryCount(): number {
    return this.history.length;
  }

  undoRecord(id: string): { success: boolean; message: string } {
    const index = this.history.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false, message: 'Action not found in undo journal' };
    }

    const record = this.history[index];
    try {
      if (record.revertType === 'move_file') {
        const { fromPath, toPath } = record.revertData;
        if (fromPath && toPath && fs.existsSync(toPath)) {
          const originalDir = path.dirname(fromPath);
          if (!fs.existsSync(originalDir)) {
            fs.mkdirSync(originalDir, { recursive: true });
          }
          fs.renameSync(toPath, fromPath);
        } else {
          return { success: false, message: `Cannot revert move: file not found at ${toPath}` };
        }
      } else if (record.revertType === 'restore_file_content') {
        const { filePath, originalContent } = record.revertData;
        if (filePath && originalContent !== undefined) {
          fs.writeFileSync(filePath, originalContent, 'utf-8');
        } else {
          return { success: false, message: 'Cannot restore file: missing path or content' };
        }
      }

      this.history.splice(index, 1);
      return { success: true, message: `Reverted: ${record.summary}` };
    } catch (err: any) {
      return { success: false, message: `Undo failed: ${err.message}` };
    }
  }

  undoAll(): { success: boolean; count: number; errors: string[] } {
    let reverted = 0;
    const errors: string[] = [];

    // Revert in reverse order of execution
    const recordsToRevert = [...this.history];
    for (const record of recordsToRevert) {
      const res = this.undoRecord(record.id);
      if (res.success) {
        reverted++;
      } else {
        errors.push(res.message);
      }
    }

    return { success: errors.length === 0, count: reverted, errors };
  }

  clear() {
    this.history = [];
  }
}

export const undoManager = new UndoManager();
