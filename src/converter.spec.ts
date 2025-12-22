import { describe, it, expect } from 'vitest';
import { convert } from './converter.js';
import { convertToString } from './convertToString.js';

describe('convert', () => {
  describe('bold', () => {
    it('converts **text** to *text*', () => {
      expect(convertToString('**bold**')).toBe('*bold*');
    });

    it('converts __text__ to *text*', () => {
      expect(convertToString('__bold__')).toBe('*bold*');
    });
  });

  describe('italic', () => {
    it('converts *text* to _text_', () => {
      expect(convertToString('*italic*')).toBe('_italic_');
    });

    it('converts _text_ to _text_', () => {
      expect(convertToString('_italic_')).toBe('_italic_');
    });
  });

  describe('strikethrough', () => {
    it('converts ~~text~~ to ~text~', () => {
      expect(convertToString('~~strikethrough~~')).toBe('~strikethrough~');
    });
  });

  describe('code', () => {
    it('converts inline `code` to ```code```', () => {
      expect(convertToString('`code`')).toBe('```code```');
    });

    it('converts code blocks', () => {
      const input = '```\ncode block\n```';
      expect(convertToString(input)).toBe('```code block```');
    });

    it('converts code blocks with language', () => {
      const input = '```javascript\nconst x = 1;\n```';
      expect(convertToString(input)).toBe('```const x = 1;```');
    });
  });

  describe('lists', () => {
    it('converts bullet lists', () => {
      const input = '- item 1\n- item 2\n- item 3';
      expect(convertToString(input)).toBe('- item 1\n- item 2\n- item 3');
    });

    it('converts numbered lists', () => {
      const input = '1. first\n2. second\n3. third';
      expect(convertToString(input)).toBe('1. first\n2. second\n3. third');
    });

    it('converts asterisk bullet lists', () => {
      const input = '* item 1\n* item 2';
      expect(convertToString(input)).toBe('- item 1\n- item 2');
    });
  });

  describe('blockquote', () => {
    it('converts blockquotes', () => {
      const input = '> This is a quote';
      expect(convertToString(input)).toBe('> This is a quote');
    });
  });

  describe('nested formatting', () => {
    it('handles bold and italic together', () => {
      expect(convertToString('**_bold italic_**')).toBe('*_bold italic_*');
    });

    it('handles italic inside bold', () => {
      expect(convertToString('**bold *italic* bold**')).toBe('*bold _italic_ bold*');
    });
  });

  describe('unsupported elements', () => {
    describe('mode: strict', () => {
      it('throws error for headers', () => {
        expect(() => convertToString('# Header', { unsupportedMode: 'strict' }))
          .toThrow('Unsupported element: heading');
      });

      it('throws error for links', () => {
        expect(() => convertToString('[link](https://example.com)', { unsupportedMode: 'strict' }))
          .toThrow('Unsupported element: link');
      });
    });

    describe('mode: strip', () => {
      it('removes headers', () => {
        expect(convertToString('# Header\ntext', { unsupportedMode: 'strip' })).toBe('text');
      });

      it('removes links', () => {
        expect(convertToString('Click [here](https://example.com)', { unsupportedMode: 'strip' }))
          .toBe('Click');
      });
    });

    describe('mode: warn (default)', () => {
      it('converts headers to bold text', () => {
        expect(convertToString('# Header')).toBe('*Header*');
      });

      it('converts links to text (url)', () => {
        expect(convertToString('[click here](https://example.com)'))
          .toBe('click here (https://example.com)');
      });

      it('converts images to alt: url', () => {
        expect(convertToString('![alt text](https://example.com/image.png)'))
          .toBe('alt text: https://example.com/image.png');
      });

      it('converts horizontal rules', () => {
        expect(convertToString('---')).toBe('---');
      });
    });

    describe('mode: ignore', () => {
      it('passes through headers as text', () => {
        expect(convertToString('# Header', { unsupportedMode: 'ignore' })).toBe('Header');
      });
    });

    describe('onUnsupported callback', () => {
      it('calls callback for each unsupported element', () => {
        const unsupported: string[] = [];
        convert('# Header\n[link](url)', {
          onUnsupported: (el) => unsupported.push(el.type)
        });
        expect(unsupported).toContain('heading');
        expect(unsupported).toContain('link');
      });

      it('includes unsupported elements in result', () => {
        const result = convert('# Header\n[link](url)');
        expect(result.unsupportedElements).toHaveLength(2);
        expect(result.unsupportedElements.map(e => e.type)).toContain('heading');
        expect(result.unsupportedElements.map(e => e.type)).toContain('link');
      });
    });
  });

  describe('mixed content', () => {
    it('handles complex markdown', () => {
      const input = `# Title

This is **bold** and *italic* text.

- Item 1
- Item 2

> A quote

\`inline code\`
`;
      const result = convert(input);
      expect(result.text).toContain('*Title*');
      expect(result.text).toContain('*bold*');
      expect(result.text).toContain('_italic_');
      expect(result.text).toContain('- Item 1');
      expect(result.text).toContain('> A quote');
      expect(result.text).toContain('```inline code```');
    });
  });

  describe('edge cases', () => {
    it('handles empty input', () => {
      expect(convertToString('')).toBe('');
    });

    it('handles plain text', () => {
      expect(convertToString('plain text')).toBe('plain text');
    });

    it('handles multiple paragraphs', () => {
      const input = 'First paragraph.\n\nSecond paragraph.';
      const result = convertToString(input);
      expect(result).toContain('First paragraph.');
      expect(result).toContain('Second paragraph.');
    });
  });
});
