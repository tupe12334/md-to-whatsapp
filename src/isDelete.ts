import type { Delete, Content, Root } from 'mdast';

export function isDelete(node: Content | Root): node is Delete {
  return node.type === 'delete';
}
