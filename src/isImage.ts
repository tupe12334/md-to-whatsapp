import type { Image, Content, Root } from 'mdast';

export function isImage(node: Content | Root): node is Image {
  return node.type === 'image';
}
