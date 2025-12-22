import type { Paragraph, Content, Root } from 'mdast';

export function isParagraph(node: Content | Root): node is Paragraph {
  return node.type === 'paragraph';
}
