import type { UnsupportedMode } from './UnsupportedMode.js';

function isValidMode(value: string): value is UnsupportedMode {
  return value === 'strict' || value === 'strip' || value === 'warn' || value === 'ignore';
}

export function parseArgs(args: string[]): { mode: UnsupportedMode; file?: string; help: boolean } {
  let mode: UnsupportedMode = 'warn';
  let file: string | undefined;
  let help = false;
  const argsLength = args.length;
  let index = 0;

  while (index < argsLength) {
    // eslint-disable-next-line security/detect-object-injection -- bounds checked with index < argsLength
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
        // eslint-disable-next-line security/detect-object-injection -- bounds checked with index < argsLength
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
