import type {
  Root,
  Content,
  Paragraph,
  Strong,
  Emphasis,
  Delete,
  List,
  ListItem,
  Blockquote,
  Heading,
  Link
} from 'mdast';

export function hasChildren(
  node: Content | Root
): node is Root | Paragraph | Strong | Emphasis | Delete | List | ListItem | Blockquote | Heading | Link {
  return 'children' in node && Array.isArray(node.children);
}
