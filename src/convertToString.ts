import { convert } from './converter.js';
import type { ConvertOptions } from './ConvertOptions.js';

export function convertToString(markdown: string, options?: ConvertOptions): string {
  let finalOptions: ConvertOptions;
  if (options) {
    finalOptions = options;
  } else {
    finalOptions = {};
  }

  return convert(markdown, finalOptions).text;
}
