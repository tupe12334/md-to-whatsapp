import { describe, it, expect } from 'vitest';
import { convert, convertToString } from './index.js';

describe('convert', () => {
  it('converts bold markdown to WhatsApp format', () => {
    const result = convert('**bold**');
    expect(result.text).toBe('*bold*');
  });

  it('converts italic markdown to WhatsApp format', () => {
    const result = convert('*italic*');
    expect(result.text).toBe('_italic_');
  });

  it('converts strikethrough markdown to WhatsApp format', () => {
    const result = convert('~~strikethrough~~');
    expect(result.text).toBe('~strikethrough~');
  });

  it('converts inline code to WhatsApp format', () => {
    const result = convert('`code`');
    expect(result.text).toBe('```code```');
  });

  it('converts code blocks to WhatsApp format', () => {
    const result = convert('```\ncode block\n```');
    expect(result.text).toBe('```code block\n```');
  });

  it('converts lists to WhatsApp format', () => {
    const result = convert('- item 1\n- item 2');
    expect(result.text).toBe('- item 1\n- item 2');
  });

  it('converts ordered lists to WhatsApp format', () => {
    const result = convert('1. first\n2. second');
    expect(result.text).toBe('1. first\n1. second');
  });

  it('converts blockquotes to WhatsApp format', () => {
    const result = convert('> quote');
    expect(result.text).toBe('> quote');
  });

  it('handles nested formatting', () => {
    const result = convert('**bold and *italic***');
    expect(result.text).toBe('*bold and _italic_*');
  });

  it('reports unsupported elements in warn mode', () => {
    const result = convert('# Heading', { unsupportedMode: 'warn' });
    expect(result.unsupportedElements).toHaveLength(1);
    expect(result.unsupportedElements[0].type).toBe('heading');
  });

  it('throws error in strict mode for unsupported elements', () => {
    expect(() => convert('# Heading', { unsupportedMode: 'strict' }))
      .toThrow();
  });

  it('strips unsupported elements in strip mode', () => {
    const result = convert('# Heading', { unsupportedMode: 'strip' });
    expect(result.text).toBe('');
  });

  it('calls onUnsupported callback for each unsupported element', () => {
    const unsupported: string[] = [];
    convert('# Heading\n\n[link](url)', {
      unsupportedMode: 'warn',
      onUnsupported: (element) => {
        unsupported.push(element.type);
      },
    });
    expect(unsupported).toContain('heading');
    expect(unsupported).toContain('link');
  });

  it('handles angle-bracket autolinks without duplication', () => {
    const result = convert('<https://example.com>', { unsupportedMode: 'warn' });
    expect(result.text).toBe('https://example.com');
  });

  it('handles markdown links with different text and url', () => {
    const result = convert('[click here](https://example.com)', { unsupportedMode: 'warn' });
    expect(result.text).toBe('click here https://example.com');
  });
});

describe('convertToString', () => {
  it('returns only the text result', () => {
    const result = convertToString('**bold**');
    expect(result).toBe('*bold*');
  });
});
