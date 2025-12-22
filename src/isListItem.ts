import type { ListItem, Content, Root } from 'mdast';

export function isListItem(node: Content | Root): node is ListItem {
  return node.type === 'listItem';
}
