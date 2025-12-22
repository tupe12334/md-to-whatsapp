#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve, normalize } from 'node:path';
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

function parseArgs(args: string[]): { mode: UnsupportedMode; file?: string; help: boolean } {
  let mode: UnsupportedMode = 'warn';
  let file: string | undefined;
  let help = false;
  const argsLength = args.length;
  let index = 0;

  while (index < argsLength) {
    const currentArg = args[index];
    if (!currentArg) {
      index++;
      continue;
    }

    if (currentArg === '--help' || currentArg === '-h') {
      help = true;
      index++;
    } else if (currentArg === '--mode') {
      index++;
      if (index < argsLength) {
        const value = args[index];
        if (!value || !isValidMode(value)) {
          console.error('Error: --mode must be one of: strict, strip, warn, ignore');
          process.exit(1);
        }
        mode = value;
        index++;
      } else {
        console.error('Error: --mode requires a value');
        process.exit(1);
      }
    } else if (!currentArg.startsWith('-')) {
      file = currentArg;
      index++;
    } else {
      console.error('Unknown option: ' + currentArg);
      process.exit(1);
    }
  }

  return { mode, file, help };
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

main();
