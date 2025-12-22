import type { Link, Content, Root } from 'mdast';

export function isLink(node: Content | Root): node is Link {
  return node.type === 'link';
}
