import type { Root, Content } from 'mdast';
import type { ConvertOptions } from './ConvertOptions.js';
import type { UnsupportedElement } from './UnsupportedElement.js';
import {
  isRoot,
  isParagraph,
  isText,
  isStrong,
  isEmphasis,
  isDelete,
  isInlineCode,
  isCode
} from './typeGuards.js';

export function processBasicNode(
  node: Content | Root,
  options: ConvertOptions,
  unsupportedElements: UnsupportedElement[],
  processNodeFn: (n: Content | Root, o: ConvertOptions, u: UnsupportedElement[]) => string
): string | null {
  if (isRoot(node)) {
    return node.children.map((child): string => processNodeFn(child, options, unsupportedElements)).join('');
  }

  if (isParagraph(node)) {
    return node.children.map((child): string => processNodeFn(child, options, unsupportedElements)).join('') + '\n\n';
  }

  if (isText(node)) {
    return node.value;
  }

  if (isStrong(node)) {
    return '*' + node.children.map((child): string => processNodeFn(child, options, unsupportedElements)).join('') + '*';
  }

  if (isEmphasis(node)) {
    return '_' + node.children.map((child): string => processNodeFn(child, options, unsupportedElements)).join('') + '_';
  }

  if (isDelete(node)) {
    return '~' + node.children.map((child): string => processNodeFn(child, options, unsupportedElements)).join('') + '~';
  }

  if (isInlineCode(node)) {
    return '```' + node.value + '```';
  }

  if (isCode(node)) {
    return '```' + node.value + '```\n\n';
  }

  return null;
}
