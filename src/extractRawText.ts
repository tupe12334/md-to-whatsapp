import type { Root, Content } from 'mdast';
import { hasChildren, hasValue } from './typeGuards.js';

export function extractRawText(node: Content | Root): string {
  if (hasValue(node)) {
    return node.value;
  }
  if (hasChildren(node)) {
    return node.children.map(extractRawText).join('');
  }
  return '';
}
