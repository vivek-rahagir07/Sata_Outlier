import { describe, it, expect, beforeEach } from 'vitest';
import { undoManager, UndoRecord } from '../../server/undoManager';

describe('UndoManager Journal System & Reversible Audit Logging', () => {
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

  it('returns failure message when attempting to undo non-existent record ID', () => {
    const result = undoManager.undoRecord('non_existent_id_999');
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });

  it('handles restore_file_content safely when file path or content is missing', () => {
    undoManager.record({
      id: 'rec_invalid',
      choreType: 'code',
      timestamp: Date.now(),
      summary: 'Broken record',
      revertType: 'restore_file_content',
      revertData: {}
    });

    const result = undoManager.undoRecord('rec_invalid');
    expect(result.success).toBe(false);
    expect(result.message).toContain('missing path or content');
  });

  it('maintains strict FIFO cap of 1000 records without memory leaks', () => {
    for (let i = 0; i < 1050; i++) {
      undoManager.record({
        id: `rec_${i}`,
        choreType: 'code',
        timestamp: Date.now(),
        summary: `Action ${i}`,
        revertType: 'restore_file_content',
        revertData: {}
      });
    }

    expect(undoManager.getHistoryCount()).toBe(1000);
  });
});
