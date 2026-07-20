#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve, normalize } from 'node:path';
import { parseArgs as nodeParseArgs } from 'node:util';
import { convert } from './index.js';
import type { UnsupportedMode } from './index.js';

const HELP = `
md-to-whatsapp - Convert Markdown to WhatsApp message formatting

Usage:
  md-to-whatsapp [options] [file]
  cat file.md | md-to-whatsapp [options]

Options:
  --mode <mode>  How to handle unsupported elements (default: warn)
                 strict - Throw error when unsupported elements found
                 strip  - Remove unsupported elements
                 warn   - Log warning and convert gracefully
                 ignore - Pass through unchanged

  --help, -h     Show this help message

Examples:
  echo "**bold** and _italic_" | md-to-whatsapp
  md-to-whatsapp README.md
  md-to-whatsapp --mode strict input.md
`;

function isValidMode(value: string): value is UnsupportedMode {
  return value === 'strict' || value === 'strip' || value === 'warn' || value === 'ignore';
}

function isErrorWithCode(err: unknown): err is Error & { code?: string } {
  return err instanceof Error;
}

function extractUnknownOption(message: string): string {
  const match = /Unknown option '(.+?)'/.exec(message);
  if (match) {
    return match[1];
  }
  return message;
}

export function parseArgs(argv: string[]): { mode: UnsupportedMode; file?: string; help: boolean } {
  let values: { mode: string; help: boolean };
  let positionals: string[];

  try {
    ({ values, positionals } = nodeParseArgs({
      args: argv,
      options: {
        mode: { type: 'string', default: 'warn' },
        help: { type: 'boolean', short: 'h', default: false }
      },
      allowPositionals: true
    }));
  } catch (err) {
    if (isErrorWithCode(err) && err.code === 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE') {
      console.error('Error: --mode requires a value');
    } else {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Unknown option: ' + extractUnknownOption(message));
    }
    process.exit(1);
  }

  const mode = values.mode;
  if (!isValidMode(mode)) {
    console.error('Error: --mode must be one of: strict, strip, warn, ignore');
    process.exit(1);
  }

  return { mode, file: positionals[0], help: values.help };
}

function readFileSafely(filePath: string): string {
  const normalizedPath = normalize(filePath);
  const resolvedPath = resolve(normalizedPath);
  return readFileSync(resolvedPath, 'utf8');
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';

    if (process.stdin.isTTY) {
      resolve('');
      return;
    }

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk: string) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { mode, file, help } = parseArgs(args);

  if (help) {
    console.log(HELP);
    process.exit(0);
  }

  let input: string;

  if (file) {
    try {
      input = readFileSafely(file);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error: ' + err.message);
      } else {
        console.error('Error reading file: ' + file);
      }
      process.exit(1);
    }
  } else {
    input = await readStdin();
    if (!input) {
      console.log(HELP);
      process.exit(0);
    }
  }

  try {
    const result = convert(input, {
      unsupportedMode: mode,
      onUnsupported: (element) => {
        if (mode === 'warn') {
          let positionInfo = '';
          if (element.position) {
            positionInfo = ' at line ' + element.position.start.line;
          }
          console.error('Warning: Unsupported element "' + element.type + '"' + positionInfo);
        }
      }
    });

    console.log(result.text);
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error: ' + err.message);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

// Only auto-run when executed directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
