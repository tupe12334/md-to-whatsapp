import { nativeBinding } from './native.js';
import type { NativeUnsupportedElement } from './native.js';

export type UnsupportedMode = 'strict' | 'strip' | 'warn' | 'ignore';

export interface Position {
  line: number;
  column: number;
}

export interface UnsupportedElement {
  type: string;
  value?: string;
  position?: {
    start: Position;
    end: Position;
  };
}

export interface ConvertOptions {
  unsupportedMode?: UnsupportedMode;
  onUnsupported?: (element: UnsupportedElement) => void;
}

export interface ConvertResult {
  text: string;
  unsupportedElements: UnsupportedElement[];
}

type NativeUnsupportedMode = 'Strict' | 'Strip' | 'Warn' | 'Ignore';

const MODE_MAP: Record<UnsupportedMode, NativeUnsupportedMode> = {
  strict: 'Strict',
  strip: 'Strip',
  warn: 'Warn',
  ignore: 'Ignore',
};

function mapNativeElement(native: NativeUnsupportedElement): UnsupportedElement {
  const element: UnsupportedElement = {
    type: native.elementType,
  };

  if (native.value) {
    element.value = native.value;
  }

  if (native.start && native.end) {
    element.position = {
      start: { line: native.start.line, column: native.start.column },
      end: { line: native.end.line, column: native.end.column },
    };
  }

  return element;
}

export function convert(markdown: string, options?: ConvertOptions): ConvertResult {
  const nativeMode = options?.unsupportedMode ? MODE_MAP[options.unsupportedMode] : undefined;
  const nativeOptions = nativeMode ? { unsupportedMode: nativeMode } : undefined;

  const nativeResult = nativeBinding.convert(markdown, nativeOptions);

  const unsupportedElements = nativeResult.unsupportedElements.map(mapNativeElement);

  if (options && options.onUnsupported) {
    for (const element of unsupportedElements) {
      options.onUnsupported(element);
    }
  }

  return {
    text: nativeResult.text,
    unsupportedElements,
  };
}

export function convertToString(markdown: string, options?: ConvertOptions): string {
  return convert(markdown, options).text;
}

export class UnsupportedElementError extends Error {
  constructor(elementType: string) {
    super('Unsupported element: ' + elementType);
    this.name = 'UnsupportedElementError';
  }
}
