import type { Root, Content } from 'mdast';
import type { ConvertOptions } from './ConvertOptions.js';
import type { UnsupportedElement } from './UnsupportedElement.js';
import { UnsupportedElementError } from './errors.js';
import { hasValue } from './typeGuards.js';
import { extractRawText } from './extractRawText.js';
import { convertUnsupportedGracefully } from './convertUnsupportedGracefully.js';

export function handleUnsupportedElement(
  node: Content | Root,
  options: ConvertOptions,
  unsupportedElements: UnsupportedElement[],
  processNodeFn: (n: Content | Root, o: ConvertOptions, u: UnsupportedElement[]) => string
): string {
  let unsupportedMode = options.unsupportedMode;
  if (!unsupportedMode) {
    unsupportedMode = 'warn';
  }
  const onUnsupported = options.onUnsupported;

  const element: UnsupportedElement = {
    type: node.type,
    position: node.position
      ? {
          start: { line: node.position.start.line, column: node.position.start.column },
          end: { line: node.position.end.line, column: node.position.end.column }
        }
      : undefined
  };

  if (hasValue(node)) {
    element.value = node.value;
  }

  unsupportedElements.push(element);
  if (onUnsupported) {
    onUnsupported(element);
  }

  if (unsupportedMode === 'strict') {
    throw new UnsupportedElementError(node.type);
  }

  if (unsupportedMode === 'strip') {
    return '';
  }

  if (unsupportedMode === 'warn') {
    return convertUnsupportedGracefully(node, options, unsupportedElements, processNodeFn);
  }

  if (unsupportedMode === 'ignore') {
    return extractRawText(node);
  }

  return '';
}
