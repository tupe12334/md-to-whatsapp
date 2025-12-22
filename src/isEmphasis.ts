import type { Emphasis, Content, Root } from 'mdast';

export function isEmphasis(node: Content | Root): node is Emphasis {
  return node.type === 'emphasis';
}
