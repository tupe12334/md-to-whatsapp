import type { InlineCode, Content, Root } from 'mdast';

export function isInlineCode(node: Content | Root): node is InlineCode {
  return node.type === 'inlineCode';
}
