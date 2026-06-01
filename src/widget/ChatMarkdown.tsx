import { Fragment, type ReactNode } from 'react';

/**
 * Minimal Markdown renderer for chat bot replies. Supports the small subset
 * the GUNDO bot actually uses (bold/italic, bullet/numbered lists,
 * paragraphs, simple links) — nothing else, by design.
 *
 * Why a custom 80-line parser instead of `react-markdown`:
 *   - Zero new dependencies / no bundle weight added to consumers.
 *   - XSS-safe by construction — we never insert raw HTML; everything goes
 *     through React text nodes / typed elements.
 *   - Predictable: the bot's prompt is tuned to a known subset; if it
 *     emits something off-grid (tables, code blocks, headings), we degrade
 *     to plain text rather than render unexpected layout.
 *
 * Caller passes the raw assistant message. Whitespace is preserved
 * within paragraphs via natural line breaks (we don't collapse them).
 */
export function ChatMarkdown({ source, className }: { source: string; className?: string }) {
  const blocks = splitIntoBlocks(source);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.kind === 'ul') {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1 my-2">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === 'ol') {
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1 my-2">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }
        // Paragraph: preserve single newlines inside as <br />.
        return (
          <p key={i} className="whitespace-pre-wrap leading-relaxed">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] };

function splitIntoBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let buffer: string[] = [];
  let listKind: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (buffer.length > 0) {
      blocks.push({ kind: 'p', text: buffer.join('\n').trim() });
      buffer = [];
    }
  };
  const flushList = () => {
    if (listKind && listItems.length > 0) {
      blocks.push({ kind: listKind, items: listItems });
    }
    listKind = null;
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const ulMatch = /^\s*[-*]\s+(.*)$/.exec(line);
    const olMatch = /^\s*\d+[.)]\s+(.*)$/.exec(line);

    if (ulMatch) {
      flushParagraph();
      if (listKind !== 'ul') {
        flushList();
        listKind = 'ul';
      }
      listItems.push(ulMatch[1]);
      continue;
    }
    if (olMatch) {
      flushParagraph();
      if (listKind !== 'ol') {
        flushList();
        listKind = 'ol';
      }
      listItems.push(olMatch[1]);
      continue;
    }

    // Empty line — paragraph or list boundary.
    if (line.trim() === '') {
      flushList();
      flushParagraph();
      continue;
    }

    // Regular text line.
    flushList();
    buffer.push(line);
  }
  flushList();
  flushParagraph();
  return blocks;
}

/**
 * Render inline markdown: `**bold**`, `*italic*` / `_italic_`,
 * `[label](url)`. Anything else stays as text. Headings (`# ...`) are
 * stripped of the leading `#`s so the bot's accidental `# Título` reads
 * as plain text rather than literal hash chars.
 */
function renderInline(text: string): ReactNode {
  // Strip leading markdown heading markers — chat is conversational; '#'
  // characters from a model slip-up shouldn't appear literally.
  const stripped = text.replace(/^\s*#{1,6}\s+/, '');
  const tokens = tokenizeInline(stripped);
  return tokens.map((t, i) => <Fragment key={i}>{t}</Fragment>);
}

function tokenizeInline(text: string): ReactNode[] {
  // Order matters: bold (`**`) before italic (`*`/`_`) to avoid eating
  // the asterisks. Links last because they're the most permissive.
  const patterns: Array<{
    regex: RegExp;
    render: (groups: string[]) => ReactNode;
  }> = [
    {
      regex: /\*\*([^*\n]+?)\*\*/,
      render: ([, inner]) => <strong>{tokenizeInline(inner)}</strong>,
    },
    {
      regex: /(?<![A-Za-z0-9])_([^_\n]+?)_(?![A-Za-z0-9])/,
      render: ([, inner]) => <em>{tokenizeInline(inner)}</em>,
    },
    {
      regex: /(?<![A-Za-z0-9])\*([^*\n]+?)\*(?![A-Za-z0-9])/,
      render: ([, inner]) => <em>{tokenizeInline(inner)}</em>,
    },
    {
      regex: /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/,
      render: ([, label, url]) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
          {label}
        </a>
      ),
    },
  ];

  // Find the earliest match across all patterns; recurse on remainder.
  let earliestIndex = -1;
  let earliestMatch: RegExpExecArray | null = null;
  let earliestRender: ((g: string[]) => ReactNode) | null = null;

  for (const { regex, render } of patterns) {
    const m = regex.exec(text);
    if (m && (earliestIndex === -1 || m.index < earliestIndex)) {
      earliestIndex = m.index;
      earliestMatch = m;
      earliestRender = render;
    }
  }

  if (!earliestMatch || !earliestRender || earliestIndex === -1) {
    return [text];
  }

  const before = text.slice(0, earliestIndex);
  const after = text.slice(earliestIndex + earliestMatch[0].length);
  const rendered = earliestRender(Array.from(earliestMatch));

  const result: ReactNode[] = [];
  if (before) result.push(before);
  result.push(rendered);
  if (after) result.push(...tokenizeInline(after));
  return result;
}
