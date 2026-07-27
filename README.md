# md-to-whatsapp

[![npm version](https://img.shields.io/npm/v/md-to-whatsapp.svg)](https://www.npmjs.com/package/md-to-whatsapp)
[![CI](https://github.com/tupe12334/md-to-whatsapp/actions/workflows/ci.yml/badge.svg)](https://github.com/tupe12334/md-to-whatsapp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Convert Markdown formatting to WhatsApp message formatting. Use it as a CLI tool or import it as a library.

## Installation

```bash
# npm
npm install md-to-whatsapp

# pnpm
pnpm add md-to-whatsapp

# yarn
yarn add md-to-whatsapp
```

For CLI-only usage:

```bash
npx md-to-whatsapp --help
```

## Formatting Conversion

| Element | Markdown | WhatsApp |
|---------|----------|----------|
| **Bold** | `**text**` or `__text__` | `*text*` |
| *Italic* | `*text*` or `_text_` | `_text_` |
| ~~Strikethrough~~ | `~~text~~` | `~text~` |
| `Code` | `` `code` `` | ` ```code``` ` |
| Code Block | ```` ```code``` ```` | ` ```code``` ` |
| Bullet List | `- item` or `* item` | `- item` |
| Numbered List | `1. item` | `1. item` |
| Blockquote | `> quote` | `> quote` |

### Unsupported Elements

These Markdown elements are not natively supported by WhatsApp:

- Headers (`#`, `##`, `###`)
- Links `[text](url)`
- Images `![alt](url)`
- Tables
- Horizontal rules (`---`)

The converter handles these gracefully based on the configured mode (see [Options](#options)).

## CLI Usage

```bash
# Pipe input
echo "**bold** and *italic*" | md-to-whatsapp
# Output: *bold* and _italic_

# File input
md-to-whatsapp README.md

# With mode option
md-to-whatsapp --mode strict input.md
```

### CLI Options

```
--mode <mode>  How to handle unsupported elements (default: warn)
               strict - Throw error when unsupported elements found
               strip  - Remove unsupported elements
               warn   - Log warning and convert gracefully
               ignore - Pass through unchanged

--help, -h     Show help message
```

## Library Usage

### Basic Usage

```typescript
import { convert, convertToString } from 'md-to-whatsapp';

// Simple conversion
const whatsappText = convertToString('**bold** and *italic*');
console.log(whatsappText); // "*bold* and _italic_"

// With result object
const result = convert('**bold** and *italic*');
console.log(result.text); // "*bold* and _italic_"
console.log(result.unsupportedElements); // []
```

### With Options

```typescript
import { convert } from 'md-to-whatsapp';

const markdown = `
# Welcome

This is **bold** and [a link](https://example.com).
`;

const result = convert(markdown, {
  unsupportedMode: 'warn',
  onUnsupported: (element) => {
    console.warn(`Unsupported: ${element.type} at line ${element.position?.start.line}`);
  }
});

console.log(result.text);
// *Welcome*
//
// This is *bold* and a link https://example.com.

console.log(result.unsupportedElements);
// [{ type: 'heading', position: {...} }, { type: 'link', position: {...} }]
```

### Unsupported Mode Behaviors

| Mode | Behavior |
|------|----------|
| `strict` | Throws an error when unsupported elements are found |
| `strip` | Removes unsupported elements entirely |
| `warn` | Converts gracefully (headers → bold, links → text (url)) |
| `ignore` | Passes through as plain text |

## API Reference

### `convert(markdown, options?)`

Converts Markdown to WhatsApp format and returns detailed result.

**Parameters:**
- `markdown: string` - The Markdown text to convert
- `options?: ConvertOptions` - Optional configuration

**Returns:** `ConvertResult`

```typescript
interface ConvertResult {
  text: string;                          // The converted WhatsApp text
  unsupportedElements: UnsupportedElement[]; // List of unsupported elements found
}
```

### `convertToString(markdown, options?)`

Converts Markdown to WhatsApp format and returns only the text.

**Parameters:**
- `markdown: string` - The Markdown text to convert
- `options?: ConvertOptions` - Optional configuration

**Returns:** `string`

### Types

```typescript
type UnsupportedMode = 'strict' | 'strip' | 'warn' | 'ignore';

interface ConvertOptions {
  unsupportedMode?: UnsupportedMode;  // Default: 'warn'
  onUnsupported?: (element: UnsupportedElement) => void;
}

interface UnsupportedElement {
  type: string;
  value?: string;
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}
```

## Examples

### Converting a README for WhatsApp

```typescript
import { readFileSync } from 'fs';
import { convertToString } from 'md-to-whatsapp';

const markdown = readFileSync('README.md', 'utf8');
const whatsappText = convertToString(markdown, {
  unsupportedMode: 'warn'
});

console.log(whatsappText);
```

### Strict Mode for Validation

```typescript
import { convert } from 'md-to-whatsapp';

try {
  convert('# Header not allowed', { unsupportedMode: 'strict' });
} catch (error) {
  console.error('Document contains unsupported elements');
}
```

### Collecting Unsupported Elements

```typescript
import { convert } from 'md-to-whatsapp';

const unsupported: string[] = [];
const result = convert(markdown, {
  onUnsupported: (el) => unsupported.push(el.type)
});

if (unsupported.length > 0) {
  console.log(`Warning: Found ${unsupported.length} unsupported elements`);
}
```

## Architecture

This package uses a native Rust implementation for high-performance markdown parsing via [pulldown-cmark](https://crates.io/crates/pulldown-cmark). The Rust code is exposed to Node.js through N-API bindings using [napi-rs](https://napi.rs/).

### Supported Platforms

- macOS (x64, ARM64)
- Linux (x64, ARM64)
- Windows (x64)

## Development

```bash
# Install dependencies
pnpm install

# Build native module and TypeScript
pnpm build

# Build only native module
pnpm build:native

# Build only TypeScript
pnpm build:ts

# Run TypeScript tests
pnpm test

# Run Rust tests
pnpm test:rust

# Type check
pnpm typecheck

# Lint
pnpm lint

# Spell check
pnpm cspell
```

### Prerequisites

- Node.js 18.19+
- pnpm
- Rust toolchain (for building from source)

## License

MIT
