import { describe, it, expect } from 'vitest';
import { codeLinter } from '../../server/choreEngines/codeLinter';

describe('CodeLinter Engine Detection', () => {
  it('instantiates codeLinter properly', () => {
    expect(codeLinter).toBeDefined();
    expect(typeof codeLinter.scanCodebase).toBe('function');
    expect(typeof codeLinter.executeFix).toBe('function');
  });

  it('rejects nonexistent directory scan safely', () => {
    expect(() => {
      codeLinter.scanCodebase('/path/that/does/not/exist_xyz_123');
    }).toThrow('Directory does not exist');
  });
});
