import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root, Content, Text, Strong, Emphasis, Delete, InlineCode, Code, List, ListItem, Blockquote, Heading, Link, Image, Paragraph } from 'mdast';

export type UnsupportedMode = 'strict' | 'strip' | 'warn' | 'ignore';

export interface UnsupportedElement {
  type: string;
  value?: string;
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
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

const UNSUPPORTED_TYPES = new Set(['heading', 'link', 'image', 'table', 'thematicBreak', 'html', 'definition', 'footnoteDefinition', 'footnoteReference']);

function isUnsupportedType(type: string): boolean {
  return UNSUPPORTED_TYPES.has(type);
}

function processNode(node: Content | Root, options: ConvertOptions, unsupportedElements: UnsupportedElement[]): string {
  const { unsupportedMode = 'warn', onUnsupported } = options;

  if (isUnsupportedType(node.type)) {
    const element: UnsupportedElement = {
      type: node.type,
      position: node.position ? {
        start: { line: node.position.start.line, column: node.position.start.column },
        end: { line: node.position.end.line, column: node.position.end.column }
      } : undefined
    };

    if ('value' in node && typeof node.value === 'string') {
      element.value = node.value;
    }

    unsupportedElements.push(element);
    onUnsupported?.(element);

    switch (unsupportedMode) {
      case 'strict':
        throw new Error(`Unsupported element: ${node.type}`);
      case 'strip':
        return '';
      case 'warn':
        // Convert gracefully
        return convertUnsupportedGracefully(node, options, unsupportedElements);
      case 'ignore':
        // Pass through - try to extract text
        return extractRawText(node);
    }
  }

  switch (node.type) {
    case 'root':
      return (node as Root).children.map(child => processNode(child, options, unsupportedElements)).join('');

    case 'paragraph':
      return (node as Paragraph).children.map(child => processNode(child, options, unsupportedElements)).join('') + '\n\n';

    case 'text':
      return (node as Text).value;

    case 'strong':
      // Markdown **text** -> WhatsApp *text*
      return '*' + (node as Strong).children.map(child => processNode(child, options, unsupportedElements)).join('') + '*';

    case 'emphasis':
      // Markdown *text* or _text_ -> WhatsApp _text_
      return '_' + (node as Emphasis).children.map(child => processNode(child, options, unsupportedElements)).join('') + '_';

    case 'delete':
      // Markdown ~~text~~ -> WhatsApp ~text~
      return '~' + (node as Delete).children.map(child => processNode(child, options, unsupportedElements)).join('') + '~';

    case 'inlineCode':
      // Markdown `code` -> WhatsApp ```code```
      return '```' + (node as InlineCode).value + '```';

    case 'code':
      // Markdown code blocks -> WhatsApp ```code```
      return '```' + (node as Code).value + '```\n\n';

    case 'list': {
      const list = node as List;
      return list.children.map((item, index) => {
        const prefix = list.ordered ? `${(list.start ?? 1) + index}. ` : '- ';
        const content = (item as ListItem).children.map(child => processNode(child, options, unsupportedElements)).join('').trim();
        return prefix + content;
      }).join('\n') + '\n\n';
    }

    case 'listItem':
      return (node as ListItem).children.map(child => processNode(child, options, unsupportedElements)).join('');

    case 'blockquote':
      return (node as Blockquote).children.map(child => {
        const text = processNode(child, options, unsupportedElements).trim();
        return text.split('\n').map(line => '> ' + line).join('\n');
      }).join('\n') + '\n\n';

    case 'break':
      return '\n';

    default:
      // Unknown node - try to process children if they exist
      if ('children' in node && Array.isArray(node.children)) {
        return (node.children as Content[]).map(child => processNode(child, options, unsupportedElements)).join('');
      }
      if ('value' in node && typeof node.value === 'string') {
        return node.value;
      }
      return '';
  }
}

function convertUnsupportedGracefully(node: Content | Root, options: ConvertOptions, unsupportedElements: UnsupportedElement[]): string {
  switch (node.type) {
    case 'heading':
      // Strip heading markers, keep text bold
      return '*' + (node as Heading).children.map(child => processNode(child, options, unsupportedElements)).join('') + '*\n\n';

    case 'link': {
      const link = node as Link;
      const text = link.children.map(child => processNode(child, options, unsupportedElements)).join('');
      return text + ' (' + link.url + ')';
    }

    case 'image': {
      const image = node as Image;
      return image.alt ? `${image.alt}: ${image.url}` : image.url;
    }

    case 'table':
      // Tables are complex - just extract text content
      return extractRawText(node) + '\n\n';

    case 'thematicBreak':
      return '---\n\n';

    default:
      return extractRawText(node);
  }
}

function extractRawText(node: Content | Root): string {
  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }
  if ('children' in node && Array.isArray(node.children)) {
    return (node.children as Content[]).map(extractRawText).join('');
  }
  return '';
}

export function convert(markdown: string, options: ConvertOptions = {}): ConvertResult {
  const processor = unified().use(remarkParse).use(remarkGfm);
  const tree = processor.parse(markdown);
  processor.runSync(tree);
  const unsupportedElements: UnsupportedElement[] = [];

  let text = processNode(tree, options, unsupportedElements);

  // Clean up excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return {
    text,
    unsupportedElements
  };
}

export function convertToString(markdown: string, options: ConvertOptions = {}): string {
  return convert(markdown, options).text;
}
