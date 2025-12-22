import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface NativeBinding {
  convert: (markdown: string, options?: NativeConvertOptions) => NativeConvertResult;
  convertToString: (markdown: string, options?: NativeConvertOptions) => string;
}

interface NativeConvertOptions {
  unsupportedMode?: 'Strict' | 'Strip' | 'Warn' | 'Ignore';
}

interface NativePosition {
  line: number;
  column: number;
}

interface NativeUnsupportedElement {
  elementType: string;
  value?: string;
  start?: NativePosition;
  end?: NativePosition;
}

interface NativeConvertResult {
  text: string;
  unsupportedElements: NativeUnsupportedElement[];
}

function loadNativeBinding(): NativeBinding {
  const platform = process.platform;
  const arch = process.arch;

  let moduleName: string;

  if (platform === 'darwin') {
    if (arch === 'arm64') {
      moduleName = 'md-to-whatsapp.darwin-arm64.node';
    } else {
      moduleName = 'md-to-whatsapp.darwin-x64.node';
    }
  } else if (platform === 'linux') {
    if (arch === 'arm64') {
      moduleName = 'md-to-whatsapp.linux-arm64-gnu.node';
    } else {
      moduleName = 'md-to-whatsapp.linux-x64-gnu.node';
    }
  } else if (platform === 'win32') {
    moduleName = 'md-to-whatsapp.win32-x64-msvc.node';
  } else {
    throw new Error('Unsupported platform: ' + platform + '-' + arch);
  }

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = dirname(currentDir);
  const modulePath = join(projectRoot, moduleName);

  try {
    const require = createRequire(import.meta.url);
    return require(modulePath) as NativeBinding;
  } catch {
    throw new Error(
      'Failed to load native module for ' + platform + '-' + arch + '. ' +
      'Make sure the native module is built for your platform.'
    );
  }
}

export const nativeBinding = loadNativeBinding();
export type { NativeConvertOptions, NativeConvertResult, NativeUnsupportedElement, NativePosition };
