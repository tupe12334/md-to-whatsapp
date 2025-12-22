import type { Blockquote, Content, Root } from 'mdast';

export function isBlockquote(node: Content | Root): node is Blockquote {
  return node.type === 'blockquote';
}
