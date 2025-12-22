import { describe, it, expect } from 'vitest';
import { UnsupportedElementError } from './errors.js';

describe('UnsupportedElementError', () => {
  it('creates error with element type in message', () => {
    const error = new UnsupportedElementError('heading');
    expect(error.message).toBe('Unsupported element: heading');
    expect(error.name).toBe('UnsupportedElementError');
  });

  it('is instance of Error', () => {
    const error = new UnsupportedElementError('link');
    expect(error instanceof Error).toBe(true);
  });
});
