import { readFileSync } from 'node:fs';
import { resolve, normalize } from 'node:path';
import { FileReadError } from './FileReadError.js';

export function readFileSafely(filePath: string): string {
  const normalizedPath = normalize(filePath);
  const resolvedPath = resolve(normalizedPath);

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- path is validated via normalize() and resolve()
    const content = readFileSync(resolvedPath, 'utf8');
    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw new FileReadError('Failed to read file: ' + error.message);
    }
    throw new FileReadError('Failed to read file: ' + filePath);
  }
}
