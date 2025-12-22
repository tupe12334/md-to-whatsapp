import type { UnsupportedElement } from './UnsupportedElement.js';

export interface ConvertResult {
  text: string;
  unsupportedElements: UnsupportedElement[];
}
