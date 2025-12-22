import { describe, it, expect } from 'vitest';
import { FileReadError } from './FileReadError.js';

describe('FileReadError', () => {
  it('creates error with message', () => {
    const error = new FileReadError('test message');
    expect(error.message).toBe('test message');
    expect(error.name).toBe('FileReadError');
  });

  it('is instance of Error', () => {
    const error = new FileReadError('test');
    expect(error instanceof Error).toBe(true);
  });
});
