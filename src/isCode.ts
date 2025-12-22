import type { Code, Content, Root } from 'mdast';

export function isCode(node: Content | Root): node is Code {
  return node.type === 'code';
}
