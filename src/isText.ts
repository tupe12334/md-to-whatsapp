import type { Text, Content, Root } from 'mdast';

export function isText(node: Content | Root): node is Text {
  return node.type === 'text';
}
