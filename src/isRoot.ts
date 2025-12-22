import type { Root, Content } from 'mdast';

export function isRoot(node: Content | Root): node is Root {
  return node.type === 'root';
}
