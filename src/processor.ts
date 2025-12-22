import type { Root, Content } from 'mdast';
import type { ConvertOptions } from './ConvertOptions.js';
import type { UnsupportedElement } from './UnsupportedElement.js';
import { isUnsupportedType, handleUnsupportedElement } from './unsupportedHandler.js';
import { processBasicNode, processComplexNode, extractRawText } from './processNodeHelpers.js';
import { hasChildren, hasValue } from './typeGuards.js';

export function processNode(
  node: Content | Root,
  options: ConvertOptions,
  unsupportedElements: UnsupportedElement[]
): string {
  if (isUnsupportedType(node.type)) {
    return handleUnsupportedElement(node, options, unsupportedElements, processNode);
  }

  const basicResult = processBasicNode(node, options, unsupportedElements, processNode);
  if (basicResult !== null) {
    return basicResult;
  }

  const complexResult = processComplexNode(node, options, unsupportedElements, processNode);
  if (complexResult !== null) {
    return complexResult;
  }

  if (hasChildren(node)) {
    return node.children.map((child): string => processNode(child, options, unsupportedElements)).join('');
  }

  if (hasValue(node)) {
    return node.value;
  }

  return '';
}
