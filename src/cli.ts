#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { convert, type UnsupportedMode } from './converter.js';

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

function parseArgs(args: string[]): { mode: UnsupportedMode; file?: string; help: boolean } {
  let mode: UnsupportedMode = 'warn';
  let file: string | undefined;
  let help = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg === '--mode') {
      const value = args[++i];
      if (!value || !['strict', 'strip', 'warn', 'ignore'].includes(value)) {
        console.error('Error: --mode must be one of: strict, strip, warn, ignore');
        process.exit(1);
      }
      mode = value as UnsupportedMode;
    } else if (!arg.startsWith('-')) {
      file = arg;
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }

  return { mode, file, help };
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';

    if (process.stdin.isTTY) {
      resolve('');
      return;
    }

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
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
      input = readFileSync(file, 'utf8');
    } catch (err) {
      console.error(`Error reading file: ${file}`);
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
          console.error(`Warning: Unsupported element "${element.type}"${element.position ? ` at line ${element.position.start.line}` : ''}`);
        }
      }
    });

    console.log(result.text);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error: ${err.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

main();
