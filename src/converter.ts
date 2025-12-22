import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { processNode } from './processor.js';
import type { ConvertOptions } from './ConvertOptions.js';
import type { ConvertResult } from './ConvertResult.js';
import type { UnsupportedElement } from './UnsupportedElement.js';

export function convert(markdown: string, options?: ConvertOptions): ConvertResult {
  let finalOptions: ConvertOptions;
  if (options) {
    finalOptions = options;
  } else {
    finalOptions = {};
  }

  const processor = unified().use(remarkParse).use(remarkGfm);
  const tree = processor.parse(markdown);
  processor.runSync(tree);
  const unsupportedElements: UnsupportedElement[] = [];

  let text = processNode(tree, finalOptions, unsupportedElements);

  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return {
    text,
    unsupportedElements
  };
}
