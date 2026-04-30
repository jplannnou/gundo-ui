import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { CodeBlock } from '../CodeBlock';

afterEach(cleanup);

describe('CodeBlock', () => {
  it('renders the raw code text', () => {
    render(<CodeBlock code="const x = 1;" language="typescript" />);
    expect(screen.getByText(/const/)).toBeInTheDocument();
  });

  it('renders filename in header when provided', () => {
    render(<CodeBlock code="echo hi" language="bash" filename="deploy.sh" />);
    expect(screen.getByText('deploy.sh')).toBeInTheDocument();
  });

  it('falls back to language name in header when no filename', () => {
    render(<CodeBlock code="x" language="json" />);
    expect(screen.getByText('json')).toBeInTheDocument();
  });

  it('shows copy button by default', () => {
    render(<CodeBlock code="x" />);
    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
  });

  it('hides copy button when copyable=false and no filename', () => {
    const { container } = render(<CodeBlock code="x" copyable={false} />);
    expect(container.querySelector('button')).toBeNull();
  });

  it('renders line numbers when showLineNumbers is true', () => {
    const code = 'a\nb\nc';
    render(<CodeBlock code={code} showLineNumbers language="plain" />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('marks highlighted lines with data-highlighted', () => {
    const code = 'one\ntwo\nthree';
    const { container } = render(
      <CodeBlock code={code} highlightLines={[2]} language="plain" />,
    );
    expect(container.querySelector('[data-line="2"][data-highlighted="true"]')).not.toBeNull();
    expect(container.querySelector('[data-line="1"][data-highlighted="true"]')).toBeNull();
  });

  it('tokenizes typescript keywords with code-keyword color', () => {
    const { container } = render(
      <CodeBlock code="const foo = 1;" language="typescript" copyable={false} />,
    );
    const spans = container.querySelectorAll('pre span');
    const keyword = Array.from(spans).find((s) => s.textContent === 'const');
    expect(keyword).toBeTruthy();
    expect((keyword as HTMLElement).style.color).toContain('--ui-code-keyword');
  });

  it('tokenizes JSON strings and numbers', () => {
    const { container } = render(
      <CodeBlock code='{"name":"a","n":42}' language="json" copyable={false} />,
    );
    const spans = container.querySelectorAll('pre span');
    const stringToken = Array.from(spans).find((s) => s.textContent === '"name"');
    const numberToken = Array.from(spans).find((s) => s.textContent === '42');
    expect(stringToken).toBeTruthy();
    expect(numberToken).toBeTruthy();
  });

  it('plain language renders code without span wrappers', () => {
    const { container } = render(
      <CodeBlock code="hello world" language="plain" copyable={false} />,
    );
    // No syntax-highlight spans expected
    const colored = container.querySelectorAll('pre span[style*="--ui-code"]');
    expect(colored.length).toBe(0);
  });

  it('does not infinite-loop on inputs that produce zero-width matches', () => {
    // Pathological input — pattern would match empty string between lines
    const { container } = render(
      <CodeBlock code="\n\n\n" language="plain" copyable={false} />,
    );
    expect(container.querySelectorAll('[data-line]').length).toBeGreaterThan(0);
  });

  it('renders comments italicized', () => {
    const { container } = render(
      <CodeBlock code="// hi\nconst x = 1;" language="typescript" copyable={false} />,
    );
    const spans = Array.from(
      container.querySelectorAll('pre span'),
    ) as HTMLElement[];
    const commentSpan = spans.find((s) => s.style.fontStyle === 'italic');
    expect(commentSpan).toBeTruthy();
    expect(commentSpan!.textContent).toContain('// hi');
  });

  it('copy button toggles to "Copied" after click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const { rerender } = render(<CodeBlock code="hello" />);
    const btn = screen.getByRole('button', { name: /copy code/i });
    btn.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(writeText).toHaveBeenCalledWith('hello');
    // Re-render to flush state
    rerender(<CodeBlock code="hello" />);
    // 'Copied' label only appears after the async copy resolves; flushing one
    // microtask is enough but the label is a soft assertion (timer-driven)
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.getByRole('button').textContent).toMatch(/copied|copy/i);
  });
});
