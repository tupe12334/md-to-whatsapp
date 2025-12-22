# Add E2E testing for CLI and API

## Summary
Add comprehensive end-to-end testing for both the CLI interface and the programmatic API.

## Current State
- Unit tests exist in Vitest (TypeScript) and Cargo (Rust)
- No e2e tests covering real-world usage patterns

## Scope

### CLI E2E Tests
- [ ] Pipe input: `echo "**bold**" | md-to-whatsapp`
- [ ] File input: `md-to-whatsapp file.md`
- [ ] Multiple files input
- [ ] Error handling (non-existent file, invalid input)
- [ ] Exit codes verification

### API E2E Tests
- [ ] `convert()` function with various markdown inputs
- [ ] `convertToString()` function
- [ ] All unsupported modes (strict/strip/warn/ignore)
- [ ] `onUnsupported` callback functionality
- [ ] Native module loading verification
- [ ] Error handling edge cases

### Test Fixtures
- [ ] Create realistic markdown test files
- [ ] Complex nested formatting examples
- [ ] Large file performance tests
- [ ] Edge cases (empty input, special characters)

## Suggested Implementation
- Use Vitest for API e2e tests
- Use shell scripts or Vitest with `execa` for CLI e2e tests
- Create `tests/e2e/` directory structure
- Add `pnpm test:e2e` script

## Acceptance Criteria
- [ ] All CLI commands tested end-to-end
- [ ] All API functions tested with realistic inputs
- [ ] Tests run in CI pipeline
- [ ] Documentation updated with testing instructions
