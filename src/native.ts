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

function getPackageName(): string {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'darwin' && arch === 'arm64') {
    return 'md-to-whatsapp-darwin-arm64';
  } else if (platform === 'darwin' && arch === 'x64') {
    return 'md-to-whatsapp-darwin-x64';
  } else if (platform === 'linux' && arch === 'x64') {
    return 'md-to-whatsapp-linux-x64-gnu';
  } else if (platform === 'linux' && arch === 'arm64') {
    return 'md-to-whatsapp-linux-arm64-gnu';
  } else if (platform === 'win32' && arch === 'x64') {
    return 'md-to-whatsapp-win32-x64-msvc';
  }
  throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

function getLocalModuleName(): string {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'darwin' && arch === 'arm64') {
    return 'md-to-whatsapp.darwin-arm64.node';
  } else if (platform === 'darwin' && arch === 'x64') {
    return 'md-to-whatsapp.darwin-x64.node';
  } else if (platform === 'linux' && arch === 'x64') {
    return 'md-to-whatsapp.linux-x64-gnu.node';
  } else if (platform === 'linux' && arch === 'arm64') {
    return 'md-to-whatsapp.linux-arm64-gnu.node';
  } else if (platform === 'win32' && arch === 'x64') {
    return 'md-to-whatsapp.win32-x64-msvc.node';
  }
  throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

function loadNativeBinding(): NativeBinding {
  const require = createRequire(import.meta.url);

  // Try loading from optional dependency (npm package)
  try {
    const packageName = getPackageName();
    return require(packageName) as NativeBinding;
  } catch {
    // Fall back to local .node file (development mode)
  }

  // Try loading from project root (for development)
  try {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const projectRoot = dirname(currentDir);
    const modulePath = join(projectRoot, getLocalModuleName());
    return require(modulePath) as NativeBinding;
  } catch {
    // Continue to error
  }

  throw new Error(
    `Failed to load native module for ${process.platform}-${process.arch}. ` +
    'Make sure the native module is installed for your platform.'
  );
}

export const nativeBinding = loadNativeBinding();
export type { NativeConvertOptions, NativeConvertResult, NativeUnsupportedElement, NativePosition };
