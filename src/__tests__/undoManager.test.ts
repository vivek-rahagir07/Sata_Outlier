import { describe, it, expect, beforeEach } from 'vitest';
import { undoManager, UndoRecord } from '../../server/undoManager';

describe('UndoManager Journal System', () => {
  beforeEach(() => {
    undoManager.clear();
  });

  it('records actions and maintains history stack', () => {
    const record: UndoRecord = {
      id: 'rec_1',
      choreType: 'code',
      timestamp: Date.now(),
      summary: 'Cleaned trailing whitespace in test.ts',
      revertType: 'restore_file_content',
      revertData: {
        filePath: '/tmp/test.ts',
        originalContent: 'console.log("hello");   '
      }
    };

    undoManager.record(record);
    expect(undoManager.getHistoryCount()).toBe(1);
    expect(undoManager.getHistory()[0].id).toBe('rec_1');
  });

  it('clears history properly', () => {
    undoManager.record({
      id: 'rec_2',
      choreType: 'folder',
      timestamp: Date.now(),
      summary: 'Moved installer to junk',
      revertType: 'move_file',
      revertData: {}
    });

    expect(undoManager.getHistoryCount()).toBe(1);
    undoManager.clear();
    expect(undoManager.getHistoryCount()).toBe(0);
  });
});

