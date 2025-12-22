const UNSUPPORTED_TYPES = new Set([
  'heading',
  'link',
  'image',
  'table',
  'thematicBreak',
  'html',
  'definition',
  'footnoteDefinition',
  'footnoteReference'
]);

export function isUnsupportedType(type: string): boolean {
  return UNSUPPORTED_TYPES.has(type);
}
