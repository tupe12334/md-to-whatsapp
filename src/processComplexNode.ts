import type { Root, Content } from 'mdast';
import type { ConvertOptions } from './ConvertOptions.js';
import type { UnsupportedElement } from './UnsupportedElement.js';
import { isList, isListItem, isBlockquote } from './typeGuards.js';

export function processComplexNode(
  node: Content | Root,
  options: ConvertOptions,
  unsupportedElements: UnsupportedElement[],
  processNodeFn: (n: Content | Root, o: ConvertOptions, u: UnsupportedElement[]) => string
): string | null {
  if (isList(node)) {
    const listChildren: string = node.children
      .map((item, index): string => {
        let listStart = node.start;
        if (!listStart) {
          listStart = 1;
        }
        const prefix = node.ordered ? listStart + index + '. ' : '- ';
        if (!isListItem(item)) {
          return '';
        }
        const content = item.children.map((child): string => processNodeFn(child, options, unsupportedElements)).join('').trim();
        return prefix + content;
      })
      .join('\n');
    return listChildren + '\n\n';
  }

  if (isListItem(node)) {
    return node.children.map((child): string => processNodeFn(child, options, unsupportedElements)).join('');
  }

  if (isBlockquote(node)) {
    const quotedLines: string = node.children
      .map((child): string => {
        const text = processNodeFn(child, options, unsupportedElements).trim();
        return text
          .split('\n')
          .map((line): string => '> ' + line)
          .join('\n');
      })
      .join('\n');
    return quotedLines + '\n\n';
  }

  if (node.type === 'break') {
    return '\n';
  }

  return null;
}
