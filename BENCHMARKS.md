# Benchmark Results: TypeScript vs Rust Implementation

Comparison of CLI performance between the TypeScript and Rust implementations of md-to-whatsapp.

## Test Configuration

- **Test file**: `README.md`
- **Method**: `time ./dist/cli.js README.md > /dev/null` (5 iterations each)
- **Platform**: macOS (darwin)

## Results

### Rust Implementation (v0.2.0 - pulldown-cmark + N-API)

| Run | Total Time |
|-----|------------|
| 1   | 50ms       |
| 2   | 40ms       |
| 3   | 36ms       |
| 4   | 46ms       |
| 5   | 36ms       |
| **Avg** | **~42ms** |

### TypeScript Implementation (v0.1.1 - remark/unified)

| Run | Total Time |
|-----|------------|
| 1   | 132ms      |
| 2   | 95ms       |
| 3   | 97ms       |
| 4   | 98ms       |
| 5   | 94ms       |
| **Avg** | **~103ms** |

## Summary

| Implementation | Avg Time | User CPU | System CPU |
|----------------|----------|----------|------------|
| **Rust**       | ~42ms    | 0.02s    | 0.01s      |
| **TypeScript** | ~103ms   | 0.09s    | 0.03s      |

**Performance improvement: ~2.5x faster with Rust**

## Package Size

| Implementation | Main Package | Platform Binary | Total Install Size | Dependencies |
|----------------|--------------|-----------------|-------------------|--------------|
| **Rust (v0.3+)** | 6KB         | 1.7-2.2MB       | ~1.8MB            | 0            |
| **Rust (v0.2)**  | 5.7MB       | (bundled)       | 5.8MB             | 0            |
| **TypeScript**   | 43KB        | N/A             | 5.1MB             | 68 packages  |

### Native Binary Sizes (Rust)

Platform-specific packages (installed as optional dependencies):

| Platform                       | Package                        | Binary Size |
|--------------------------------|--------------------------------|-------------|
| macOS ARM64 (M1/M2/M3)         | md-to-whatsapp-darwin-arm64    | 1.7MB       |
| Linux x64 (glibc)              | md-to-whatsapp-linux-x64-gnu   | 2.2MB       |
| Windows x64                    | md-to-whatsapp-win32-x64-msvc  | 1.9MB       |

### Analysis

The Rust implementation uses optional dependencies to only download the binary for your platform:

- **v0.3+**: Uses `optionalDependencies` - npm/pnpm automatically downloads only your platform's binary
- **v0.2**: Bundled all platform binaries in a single package (5.7MB)
- **TypeScript**: Required 68 runtime dependencies (remark-gfm, remark-parse, unified)

**Key advantages of Rust (v0.3+):**
- ~70% smaller install size than previous version (1.8MB vs 5.8MB)
- ~65% smaller than TypeScript version (1.8MB vs 5.1MB)
- Zero runtime dependencies
- Faster installation
- Reduced supply chain risk

## Why Rust is Faster

The Rust implementation achieves better performance due to:

- **pulldown-cmark**: SIMD-optimized markdown parsing
- **Zero-copy string handling**: Minimal memory allocations
- **Native code execution**: N-API bindings run compiled machine code
- **No AST overhead**: Direct string parsing with state machine vs full AST construction and traversal

## Commits Compared

- **TypeScript**: `00f26bf` (v0.1.1)
- **Rust**: `3672103` (v0.2.0)
