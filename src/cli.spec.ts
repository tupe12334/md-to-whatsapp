import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseArgs } from './cli.js';

export class ExitError extends Error {
  constructor(public code: number | string | null | undefined) {
    super(`process.exit(${String(code)})`);
  }
}

function mockExit() {
  return vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => {
    throw new ExitError(code);
  });
}

describe('parseArgs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to mode "warn" with no args', () => {
    expect(parseArgs([])).toEqual({ mode: 'warn', file: undefined, help: false });
  });

  it('parses --help', () => {
    expect(parseArgs(['--help'])).toEqual({ mode: 'warn', file: undefined, help: true });
  });

  it('parses -h', () => {
    expect(parseArgs(['-h'])).toEqual({ mode: 'warn', file: undefined, help: true });
  });

  it('parses a positional file argument', () => {
    expect(parseArgs(['input.md'])).toEqual({ mode: 'warn', file: 'input.md', help: false });
  });

  it('parses --mode <value>', () => {
    expect(parseArgs(['--mode', 'strict'])).toEqual({ mode: 'strict', file: undefined, help: false });
  });

  it('parses --mode=value syntax', () => {
    expect(parseArgs(['--mode=strict'])).toEqual({ mode: 'strict', file: undefined, help: false });
  });

  it('parses --mode=value together with a positional file', () => {
    expect(parseArgs(['--mode=strip', 'input.md'])).toEqual({ mode: 'strip', file: 'input.md', help: false });
  });

  it('errors when --mode is missing its value', () => {
    const exitSpy = mockExit();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => parseArgs(['--mode'])).toThrow(ExitError);
    expect(errorSpy).toHaveBeenCalledWith('Error: --mode requires a value');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('errors when --mode has an invalid value', () => {
    const exitSpy = mockExit();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => parseArgs(['--mode', 'bogus'])).toThrow(ExitError);
    expect(errorSpy).toHaveBeenCalledWith('Error: --mode must be one of: strict, strip, warn, ignore');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('errors on an unknown option', () => {
    const exitSpy = mockExit();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => parseArgs(['--bogus'])).toThrow(ExitError);
    expect(errorSpy).toHaveBeenCalledWith('Unknown option: --bogus');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
