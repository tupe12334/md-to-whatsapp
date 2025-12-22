import type { Content, Root, Text, InlineCode, Code } from 'mdast';

export function hasValue(node: Content | Root): node is Text | InlineCode | Code {
  return 'value' in node && typeof node.value === 'string';
}
