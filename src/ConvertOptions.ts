import type { UnsupportedMode } from './UnsupportedMode.js';
import type { UnsupportedElement } from './UnsupportedElement.js';

export interface ConvertOptions {
  unsupportedMode?: UnsupportedMode;
  onUnsupported?: (element: UnsupportedElement) => void;
}
