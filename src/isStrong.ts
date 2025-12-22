import type { Strong, Content, Root } from 'mdast';

export function isStrong(node: Content | Root): node is Strong {
  return node.type === 'strong';
}
