import type { List, Content, Root } from 'mdast';

export function isList(node: Content | Root): node is List {
  return node.type === 'list';
}
