import type { HTMLAttributes, ReactElement } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface MarkdownRendererProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  /** Allow raw HTML (default: false — strips all tags) */
  allowHtml?: boolean;
}

/* ─── Parser ─────────────────────────────────────────────────────────── */

// Parses a subset of Markdown to React-safe JSX without dangerouslySetInnerHTML
// Supports: h1-h4, bold, italic, code, code blocks, links, ul/ol, blockquote, hr, paragraphs

type Token =
  | { type: 'h1' | 'h2' | 'h3' | 'h4'; text: string }
  | { type: 'hr' }
  | { type: 'codeblock'; lang: string; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'p'; text: string }
  | { type: 'blank' };

function tokenize(markdown: string): Token[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const tokens: Token[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      tokens.push({ type: 'codeblock', lang, text: codeLines.join('\n') });
      i++;
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length as 1 | 2 | 3 | 4;
      tokens.push({ type: `h${level}` as 'h1' | 'h2' | 'h3' | 'h4', text: hMatch[2] });
      i++;
      continue;
    }

    // HR
    if (/^[-*_]{3,}$/.test(line.trim())) {
      tokens.push({ type: 'hr' });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      tokens.push({ type: 'blockquote', text: line.slice(2) });
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s/, ''));
        i++;
      }
      tokens.push({ type: 'ul', items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      tokens.push({ type: 'ol', items });
      continue;
    }

    // Blank
    if (line.trim() === '') {
      tokens.push({ type: 'blank' });
      i++;
      continue;
    }

    // Paragraph
    const pLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !lines[i].startsWith('```') && !lines[i].startsWith('> ')) {
      pLines.push(lines[i]);
      i++;
    }
    tokens.push({ type: 'p', text: pLines.join(' ') });
  }

  return tokens;
}

// Parses inline markdown: **bold**, *italic*, `code`, [link](url)
function parseInline(text: string): (string | ReactElement)[] {
  const result: (string | ReactElement)[] = [];
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    const full = match[1];
    if (full.startsWith('**')) {
      result.push(<strong key={match.index} className="font-semibold text-[var(--ui-text)]">{match[2]}</strong>);
    } else if (full.startsWith('*')) {
      result.push(<em key={match.index} className="italic">{match[3]}</em>);
    } else if (full.startsWith('`')) {
      result.push(
        <code key={match.index} className="rounded bg-[var(--ui-surface-hover)] px-1 py-0.5 font-mono text-[0.85em] text-[var(--ui-primary)]">
          {match[4]}
        </code>,
      );
    } else if (full.startsWith('[')) {
      result.push(
        <a
          key={match.index}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--ui-primary)] underline underline-offset-2 hover:text-[var(--ui-primary-hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ui-primary)] rounded"
        >
          {match[5]}
        </a>,
      );
    }
    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

/* ─── MarkdownRenderer ────────────────────────────────────────────────── */

export function MarkdownRenderer({
  content,
  className = '',
  ...props
}: MarkdownRendererProps) {
  const tokens = tokenize(content);

  const rendered = tokens
    .filter((t) => t.type !== 'blank')
    .map((token, i) => {
      switch (token.type) {
        case 'h1':
          return (
            <h1 key={i} className="text-2xl font-bold text-[var(--ui-text)] mb-3 mt-6 first:mt-0">
              {parseInline(token.text)}
            </h1>
          );
        case 'h2':
          return (
            <h2 key={i} className="text-xl font-bold text-[var(--ui-text)] mb-2 mt-5 first:mt-0">
              {parseInline(token.text)}
            </h2>
          );
        case 'h3':
          return (
            <h3 key={i} className="text-base font-semibold text-[var(--ui-text)] mb-2 mt-4 first:mt-0">
              {parseInline(token.text)}
            </h3>
          );
        case 'h4':
          return (
            <h4 key={i} className="text-sm font-semibold text-[var(--ui-text)] mb-1.5 mt-3 first:mt-0">
              {parseInline(token.text)}
            </h4>
          );
        case 'hr':
          return <hr key={i} className="my-4 border-[var(--ui-border)]" />;
        case 'codeblock':
          return (
            <pre
              key={i}
              className="my-3 overflow-x-auto rounded-lg bg-[var(--ui-surface-raised)] p-4 font-mono text-sm text-[var(--ui-text-secondary)]"
              data-language={token.lang || undefined}
            >
              <code>{token.text}</code>
            </pre>
          );
        case 'blockquote':
          return (
            <blockquote
              key={i}
              className="my-3 border-l-4 border-[var(--ui-primary)] pl-4 text-sm italic text-[var(--ui-text-secondary)]"
            >
              {parseInline(token.text)}
            </blockquote>
          );
        case 'ul':
          return (
            <ul key={i} className="my-2 ml-4 list-disc space-y-1 text-sm text-[var(--ui-text-secondary)]">
              {token.items.map((item, j) => (
                <li key={j}>{parseInline(item)}</li>
              ))}
            </ul>
          );
        case 'ol':
          return (
            <ol key={i} className="my-2 ml-4 list-decimal space-y-1 text-sm text-[var(--ui-text-secondary)]">
              {token.items.map((item, j) => (
                <li key={j}>{parseInline(item)}</li>
              ))}
            </ol>
          );
        case 'p':
          return (
            <p key={i} className="my-2 text-sm leading-relaxed text-[var(--ui-text-secondary)]">
              {parseInline(token.text)}
            </p>
          );
        default:
          return null;
      }
    });

  return (
    <div
      className={`prose-gundo text-[var(--ui-text-secondary)] ${className}`}
      {...props}
    >
      {rendered}
    </div>
  );
}
