import type { Heading, Content, Root } from 'mdast';

export function isHeading(node: Content | Root): node is Heading {
  return node.type === 'heading';
}
