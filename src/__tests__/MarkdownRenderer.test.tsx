import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarkdownRenderer } from '../MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders plain text', () => {
    render(<MarkdownRenderer content="Hola mundo" />);
    expect(screen.getByText('Hola mundo')).toBeInTheDocument();
  });

  it('renders h1', () => {
    render(<MarkdownRenderer content="# Título principal" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Título principal' })).toBeInTheDocument();
  });

  it('renders h2', () => {
    render(<MarkdownRenderer content="## Subtítulo" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Subtítulo' })).toBeInTheDocument();
  });

  it('renders h3', () => {
    render(<MarkdownRenderer content="### Sección" />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders bold text', () => {
    render(<MarkdownRenderer content="Texto **negrita** aquí" />);
    expect(screen.getByText('negrita').tagName).toBe('STRONG');
  });

  it('renders italic text', () => {
    render(<MarkdownRenderer content="Texto *cursiva* aquí" />);
    expect(screen.getByText('cursiva').tagName).toBe('EM');
  });

  it('renders inline code', () => {
    render(<MarkdownRenderer content="Usa `npm install`" />);
    expect(screen.getByText('npm install').tagName).toBe('CODE');
  });

  it('renders code block', () => {
    render(<MarkdownRenderer content={"```js\nconst x = 1;\n```"} />);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('renders unordered list', () => {
    render(<MarkdownRenderer content={"- Item 1\n- Item 2\n- Item 3"} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders ordered list', () => {
    render(<MarkdownRenderer content={"1. Primero\n2. Segundo"} />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
  });

  it('renders blockquote', () => {
    render(<MarkdownRenderer content="> Una cita" />);
    expect(screen.getByText('Una cita').closest('blockquote')).toBeInTheDocument();
  });

  it('renders link with external target', () => {
    render(<MarkdownRenderer content="[Gundo](https://gundo.life)" />);
    const link = screen.getByRole('link', { name: 'Gundo' });
    expect(link).toHaveAttribute('href', 'https://gundo.life');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders hr', () => {
    render(<MarkdownRenderer content="---" />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
