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

| Implementation | Package Size | Dependencies | Total Install Size |
|----------------|--------------|--------------|-------------------|
| **Rust**       | 5.7MB        | 0            | 5.8MB             |
| **TypeScript** | 43KB         | 68 packages  | 5.1MB             |

### Native Binary Sizes (Rust)

The Rust package includes pre-built binaries for multiple platforms:

| Platform         | Binary Size |
|------------------|-------------|
| darwin-arm64     | 1.7MB       |
| linux-x64-gnu    | 2.2MB       |
| win32-x64-msvc   | 1.9MB       |

### Analysis

While the Rust package itself is larger (5.7MB vs 43KB), this is because it includes pre-built native binaries for all supported platforms. The TypeScript version requires 68 runtime dependencies (remark-gfm, remark-parse, unified, and their transitive dependencies), resulting in a similar total install size.

**Key trade-offs:**
- **Rust**: Larger package, zero runtime dependencies, faster installation
- **TypeScript**: Smaller package, many runtime dependencies, potential supply chain concerns

## Why Rust is Faster

The Rust implementation achieves better performance due to:

- **pulldown-cmark**: SIMD-optimized markdown parsing
- **Zero-copy string handling**: Minimal memory allocations
- **Native code execution**: N-API bindings run compiled machine code
- **No AST overhead**: Direct string parsing with state machine vs full AST construction and traversal

## Commits Compared

- **TypeScript**: `00f26bf` (v0.1.1)
- **Rust**: `3672103` (v0.2.0)
