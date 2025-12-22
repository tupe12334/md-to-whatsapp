import type { Root, Content } from 'mdast';
import type { ConvertOptions } from './ConvertOptions.js';
import type { UnsupportedElement } from './UnsupportedElement.js';
import { isHeading, isLink, isImage } from './typeGuards.js';
import { extractRawText } from './extractRawText.js';

export function convertUnsupportedGracefully(
  node: Content | Root,
  options: ConvertOptions,
  unsupportedElements: UnsupportedElement[],
  processNodeFn: (n: Content | Root, o: ConvertOptions, u: UnsupportedElement[]) => string
): string {
  if (isHeading(node)) {
    const processedChildren: string = node.children.map((child): string => processNodeFn(child, options, unsupportedElements)).join('');
    return '*' + processedChildren + '*\n\n';
  }

  if (isLink(node)) {
    const processedText: string = node.children.map((child): string => processNodeFn(child, options, unsupportedElements)).join('');
    return processedText + ' (' + node.url + ')';
  }

  if (isImage(node)) {
    if (node.alt) {
      return node.alt + ': ' + node.url;
    }
    return node.url;
  }

  if (node.type === 'table') {
    return extractRawText(node) + '\n\n';
  }

  if (node.type === 'thematicBreak') {
    return '---\n\n';
  }

  return extractRawText(node);
}
