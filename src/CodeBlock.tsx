'use client';
import { useMemo, type HTMLAttributes } from 'react';
import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from './utils/useCopyToClipboard';

/**
 * `<CodeBlock>` — syntax-highlighted code block with optional filename, line numbers,
 * line highlighting and copy-to-clipboard.
 *
 * Zero-dep tokenizer (no Shiki/Prism). Covers the languages used in GUNDO docs
 * surfaces (architecture, legal, comms-plan): typescript/tsx/javascript/jsx,
 * json, bash, css, html, markdown, sql, python. Falls back to `plain` rendering
 * for unsupported languages.
 *
 * Tokens come from `--ui-code-*` (defined in `theme.css`), so the same component
 * adapts to dark/light theme without per-consumer config.
 */

export type CodeLanguage =
  | 'typescript'
  | 'tsx'
  | 'javascript'
  | 'jsx'
  | 'json'
  | 'bash'
  | 'shell'
  | 'css'
  | 'html'
  | 'markdown'
  | 'md'
  | 'sql'
  | 'python'
  | 'plain';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Source code to render (raw string, no escape). */
  code: string;
  /** Language for syntax highlighting. Falls back to `plain` if unknown. */
  language?: CodeLanguage;
  /** Optional filename shown as the block header. */
  filename?: string;
  /** Render line numbers in the gutter. Default: false. */
  showLineNumbers?: boolean;
  /** 1-indexed line numbers to highlight (background tint). */
  highlightLines?: number[];
  /** Show the copy button. Default: true. */
  copyable?: boolean;
}

type TokenType =
  | 'plain'
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'tag'
  | 'punctuation';

interface Rule {
  type: TokenType;
  pattern: string; // regex source — combined into a single alternation
}

const JS_KEYWORDS =
  '(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|throw|try|catch|finally|class|extends|super|this|import|export|from|as|default|async|await|yield|typeof|instanceof|in|of|void|null|undefined|true|false|interface|type|enum|implements|public|private|protected|readonly|static|abstract|namespace)';
const PY_KEYWORDS =
  '(?:def|class|return|if|elif|else|for|while|break|continue|try|except|finally|raise|import|from|as|with|lambda|yield|pass|global|nonlocal|in|is|not|and|or|None|True|False|self|async|await)';
const SQL_KEYWORDS =
  '(?:SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|NULL|IS|IN|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|ADD|COLUMN|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|CONSTRAINT|DISTINCT|UNION|CASE|WHEN|THEN|ELSE|END|WITH|RETURNING)';
const BASH_KEYWORDS =
  '(?:if|then|else|elif|fi|for|while|do|done|case|esac|in|function|return|export|source|alias|unset|cd|pushd|popd|echo|printf|read|set|unset|exit|exec)';

// Pattern fragments — rule order is critical: comment > string > number > keyword > function > tag > punctuation
const RULES: Record<CodeLanguage, Rule[]> = {
  plain: [],
  typescript: [
    { type: 'comment', pattern: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/' },
    { type: 'string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`' },
    { type: 'number', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
    { type: 'keyword', pattern: `\\b${JS_KEYWORDS}\\b` },
    { type: 'function', pattern: '\\b[A-Za-z_$][\\w$]*(?=\\s*\\()' },
    { type: 'punctuation', pattern: '[{}\\[\\]();,.:]' },
  ],
  tsx: [
    { type: 'comment', pattern: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|\\{\\/\\*[\\s\\S]*?\\*\\/\\}' },
    { type: 'string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`' },
    { type: 'tag', pattern: '<\\/?[A-Za-z][\\w.-]*' },
    { type: 'number', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
    { type: 'keyword', pattern: `\\b${JS_KEYWORDS}\\b` },
    { type: 'function', pattern: '\\b[A-Za-z_$][\\w$]*(?=\\s*\\()' },
    { type: 'punctuation', pattern: '[{}\\[\\]();,.:>=/]' },
  ],
  javascript: [
    { type: 'comment', pattern: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/' },
    { type: 'string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`' },
    { type: 'number', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
    { type: 'keyword', pattern: `\\b${JS_KEYWORDS}\\b` },
    { type: 'function', pattern: '\\b[A-Za-z_$][\\w$]*(?=\\s*\\()' },
    { type: 'punctuation', pattern: '[{}\\[\\]();,.:]' },
  ],
  jsx: [
    { type: 'comment', pattern: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|\\{\\/\\*[\\s\\S]*?\\*\\/\\}' },
    { type: 'string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`' },
    { type: 'tag', pattern: '<\\/?[A-Za-z][\\w.-]*' },
    { type: 'number', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
    { type: 'keyword', pattern: `\\b${JS_KEYWORDS}\\b` },
    { type: 'function', pattern: '\\b[A-Za-z_$][\\w$]*(?=\\s*\\()' },
    { type: 'punctuation', pattern: '[{}\\[\\]();,.:>=/]' },
  ],
  json: [
    { type: 'string', pattern: '"(?:\\\\.|[^"\\\\])*"' },
    { type: 'number', pattern: '-?\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b' },
    { type: 'keyword', pattern: '\\b(?:true|false|null)\\b' },
    { type: 'punctuation', pattern: '[{}\\[\\]:,]' },
  ],
  bash: [
    { type: 'comment', pattern: '#[^\\n]*' },
    { type: 'string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'[^\']*\'' },
    { type: 'number', pattern: '\\b\\d+\\b' },
    { type: 'keyword', pattern: `\\b${BASH_KEYWORDS}\\b` },
    { type: 'function', pattern: '\\$\\{?[A-Za-z_][\\w]*\\}?' },
    { type: 'punctuation', pattern: '[|&;<>()\\[\\]{}]' },
  ],
  shell: [
    { type: 'comment', pattern: '#[^\\n]*' },
    { type: 'string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'[^\']*\'' },
    { type: 'number', pattern: '\\b\\d+\\b' },
    { type: 'keyword', pattern: `\\b${BASH_KEYWORDS}\\b` },
    { type: 'function', pattern: '\\$\\{?[A-Za-z_][\\w]*\\}?' },
    { type: 'punctuation', pattern: '[|&;<>()\\[\\]{}]' },
  ],
  css: [
    { type: 'comment', pattern: '\\/\\*[\\s\\S]*?\\*\\/' },
    { type: 'string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' },
    { type: 'number', pattern: '\\b\\d+(?:\\.\\d+)?(?:px|em|rem|%|vh|vw|s|ms|deg)?\\b' },
    { type: 'keyword', pattern: '@(?:media|import|keyframes|theme|layer|supports|font-face|charset|page)\\b' },
    { type: 'tag', pattern: '#[A-Za-z][\\w-]*|\\.[A-Za-z][\\w-]*|\\b[A-Za-z][\\w-]*(?=\\s*\\{)' },
    { type: 'function', pattern: '[A-Za-z-]+(?=\\()' },
    { type: 'punctuation', pattern: '[{}();,:]' },
  ],
  html: [
    { type: 'comment', pattern: '<!--[\\s\\S]*?-->' },
    { type: 'string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' },
    { type: 'tag', pattern: '<\\/?[A-Za-z][\\w-]*|>|/>' },
    { type: 'function', pattern: '\\b[A-Za-z-]+(?=\\=)' },
    { type: 'punctuation', pattern: '[=]' },
  ],
  markdown: [
    { type: 'comment', pattern: '<!--[\\s\\S]*?-->' },
    { type: 'string', pattern: '`[^`\\n]*`' },
    { type: 'tag', pattern: '^#{1,6}\\s+[^\\n]*' },
    { type: 'keyword', pattern: '\\*\\*[^*\\n]+\\*\\*|__[^_\\n]+__|_[^_\\n]+_|\\*[^*\\n]+\\*' },
    { type: 'function', pattern: '\\[[^\\]\\n]+\\]\\([^)\\n]+\\)' },
    { type: 'punctuation', pattern: '^[-*+]\\s|^\\d+\\.\\s|^>\\s' },
  ],
  md: [
    { type: 'comment', pattern: '<!--[\\s\\S]*?-->' },
    { type: 'string', pattern: '`[^`\\n]*`' },
    { type: 'tag', pattern: '^#{1,6}\\s+[^\\n]*' },
    { type: 'keyword', pattern: '\\*\\*[^*\\n]+\\*\\*|__[^_\\n]+__|_[^_\\n]+_|\\*[^*\\n]+\\*' },
    { type: 'function', pattern: '\\[[^\\]\\n]+\\]\\([^)\\n]+\\)' },
    { type: 'punctuation', pattern: '^[-*+]\\s|^\\d+\\.\\s|^>\\s' },
  ],
  sql: [
    { type: 'comment', pattern: '--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/' },
    { type: 'string', pattern: '\'(?:\\\\.|[^\'\\\\])*\'|"(?:\\\\.|[^"\\\\])*"' },
    { type: 'number', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
    { type: 'keyword', pattern: `\\b${SQL_KEYWORDS}\\b` },
    { type: 'function', pattern: '\\b[A-Za-z_][\\w]*(?=\\s*\\()' },
    { type: 'punctuation', pattern: '[(),;.*]' },
  ],
  python: [
    { type: 'comment', pattern: '#[^\\n]*' },
    { type: 'string', pattern: '"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' },
    { type: 'number', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
    { type: 'keyword', pattern: `\\b${PY_KEYWORDS}\\b` },
    { type: 'function', pattern: '\\b[A-Za-z_][\\w]*(?=\\s*\\()' },
    { type: 'punctuation', pattern: '[{}\\[\\]();,.:]' },
  ],
};

interface CompiledRules {
  regex: RegExp;
  types: TokenType[];
}

const compiledCache = new Map<CodeLanguage, CompiledRules | null>();

function compileRules(language: CodeLanguage): CompiledRules | null {
  if (compiledCache.has(language)) return compiledCache.get(language)!;
  const rules = RULES[language];
  if (!rules || rules.length === 0) {
    compiledCache.set(language, null);
    return null;
  }
  // Each rule wrapped in its own capture group so we can identify which one matched
  const source = rules.map((r) => `(${r.pattern})`).join('|');
  const compiled: CompiledRules = {
    regex: new RegExp(source, 'gm'),
    types: rules.map((r) => r.type),
  };
  compiledCache.set(language, compiled);
  return compiled;
}

interface Token {
  type: TokenType;
  text: string;
}

function tokenize(code: string, language: CodeLanguage): Token[] {
  const compiled = compileRules(language);
  if (!compiled) return [{ type: 'plain', text: code }];

  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  // Reset regex state — it is shared between calls via cache
  compiled.regex.lastIndex = 0;

  while ((match = compiled.regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', text: code.slice(lastIndex, match.index) });
    }
    // Find which capture group matched
    let groupIndex = -1;
    for (let i = 1; i < match.length; i++) {
      if (match[i] !== undefined) {
        groupIndex = i - 1;
        break;
      }
    }
    if (groupIndex >= 0) {
      tokens.push({ type: compiled.types[groupIndex], text: match[0] });
    } else {
      tokens.push({ type: 'plain', text: match[0] });
    }
    lastIndex = match.index + match[0].length;
    // Guard against zero-width matches that would loop forever
    if (match[0].length === 0) compiled.regex.lastIndex++;
  }
  if (lastIndex < code.length) {
    tokens.push({ type: 'plain', text: code.slice(lastIndex) });
  }
  return tokens;
}

const TOKEN_COLOR: Record<TokenType, string> = {
  plain: 'var(--ui-code-text)',
  keyword: 'var(--ui-code-keyword)',
  string: 'var(--ui-code-string)',
  number: 'var(--ui-code-number)',
  comment: 'var(--ui-code-comment)',
  function: 'var(--ui-code-function)',
  tag: 'var(--ui-code-tag)',
  punctuation: 'var(--ui-code-punctuation)',
};

function renderTokens(tokens: Token[]): React.ReactNode[] {
  return tokens.map((t, i) => {
    if (t.type === 'plain') return t.text;
    const style: React.CSSProperties = { color: TOKEN_COLOR[t.type] };
    if (t.type === 'comment') style.fontStyle = 'italic';
    return (
      <span key={i} style={style}>
        {t.text}
      </span>
    );
  });
}

function splitLines(nodes: React.ReactNode[]): React.ReactNode[][] {
  const lines: React.ReactNode[][] = [[]];
  for (const node of nodes) {
    if (typeof node === 'string') {
      const parts = node.split('\n');
      parts.forEach((part, idx) => {
        if (idx > 0) lines.push([]);
        if (part.length > 0) lines[lines.length - 1].push(part);
      });
    } else {
      lines[lines.length - 1].push(node);
    }
  }
  return lines;
}

export function CodeBlock({
  code,
  language = 'plain',
  filename,
  showLineNumbers = false,
  highlightLines,
  copyable = true,
  className = '',
  ...props
}: CodeBlockProps) {
  const { copy, copied } = useCopyToClipboard();
  const trimmed = useMemo(() => code.replace(/\n$/, ''), [code]);

  const lines = useMemo(() => {
    const tokens = tokenize(trimmed, language);
    const nodes = renderTokens(tokens);
    return splitLines(nodes);
  }, [trimmed, language]);

  const highlightSet = useMemo(
    () => new Set(highlightLines ?? []),
    [highlightLines],
  );

  return (
    <div
      className={`overflow-hidden rounded-lg border ${className}`}
      style={{
        borderColor: 'var(--ui-border)',
        backgroundColor: 'var(--ui-code-bg)',
      }}
      {...props}
    >
      {(filename || copyable) && (
        <div
          className="flex items-center justify-between border-b px-3 py-2"
          style={{ borderColor: 'var(--ui-border)' }}
        >
          <span
            className="text-xs font-mono"
            style={{ color: 'var(--ui-text-secondary)' }}
          >
            {filename ?? language}
          </span>
          {copyable && (
            <button
              type="button"
              onClick={() => void copy(trimmed)}
              className="ui-focus-ring inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
              style={{
                color: 'var(--ui-text-secondary)',
                // Native <button> bg is browser-default (~#efefef in Chrome).
                // Without Tailwind processing in axe-test harness, that bg leaks
                // through and breaks contrast. Explicit transparent inherits
                // the surrounding code-bg deterministically.
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label={copied ? 'Copied' : 'Copy code'}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      <pre
        className="overflow-x-auto p-4 text-sm leading-relaxed"
        style={{
          fontFamily: 'var(--ui-font-mono)',
          color: 'var(--ui-code-text)',
          margin: 0,
        }}
      >
        <code>
          {lines.map((lineNodes, i) => {
            const lineNumber = i + 1;
            const isHighlighted = highlightSet.has(lineNumber);
            return (
              <div
                key={i}
                data-line={lineNumber}
                data-highlighted={isHighlighted || undefined}
                style={{
                  display: 'flex',
                  marginInline: '-1rem',
                  paddingInline: '1rem',
                  borderLeft: isHighlighted
                    ? '3px solid var(--ui-primary)'
                    : '3px solid transparent',
                }}
              >
                {showLineNumbers && (
                  <span
                    aria-hidden="true"
                    role="presentation"
                    style={{
                      color: 'var(--ui-text-secondary)',
                      userSelect: 'none',
                      paddingRight: '1rem',
                      minWidth: '2rem',
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {lineNumber}
                  </span>
                )}
                <span style={{ flex: 1, whiteSpace: 'pre' }}>
                  {lineNodes.length === 0 ? ' ' : lineNodes}
                </span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
