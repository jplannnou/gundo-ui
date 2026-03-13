import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentThread, type Comment } from '../CommentThread';

const comments: Comment[] = [
  {
    id: '1',
    author: { name: 'Ana García', initials: 'AG' },
    content: 'Este producto es genial',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '2',
    author: { name: 'Pedro López', initials: 'PL' },
    content: 'Totalmente de acuerdo',
    createdAt: new Date('2026-01-16'),
    badge: 'Admin',
    replies: [
      {
        id: '3',
        author: { name: 'María', initials: 'M' },
        content: 'Gracias por el comentario',
        createdAt: new Date('2026-01-17'),
      },
    ],
  },
];

describe('CommentThread', () => {
  it('renders all comments', () => {
    render(<CommentThread comments={comments} />);
    expect(screen.getByText('Este producto es genial')).toBeInTheDocument();
    expect(screen.getByText('Totalmente de acuerdo')).toBeInTheDocument();
  });

  it('renders nested replies', () => {
    render(<CommentThread comments={comments} />);
    expect(screen.getByText('Gracias por el comentario')).toBeInTheDocument();
  });

  it('renders author names', () => {
    render(<CommentThread comments={comments} />);
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('Pedro López')).toBeInTheDocument();
  });

  it('renders badge on author', () => {
    render(<CommentThread comments={comments} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders empty message when no comments', () => {
    render(<CommentThread comments={[]} />);
    expect(screen.getByText('Sé el primero en comentar.')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(<CommentThread comments={[]} emptyMessage="Sin comentarios aún." />);
    expect(screen.getByText('Sin comentarios aún.')).toBeInTheDocument();
  });

  it('shows composer when onAddComment is provided', () => {
    render(<CommentThread comments={[]} onAddComment={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onAddComment when form is submitted', async () => {
    const onAdd = vi.fn();
    const { container } = render(<CommentThread comments={[]} onAddComment={onAdd} />);
    const textarea = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Nuevo comentario' } });
    });
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    expect(onAdd).toHaveBeenCalledWith('Nuevo comentario');
  });

  it('does not submit empty comment', async () => {
    const onAdd = vi.fn();
    const { container } = render(<CommentThread comments={[]} onAddComment={onAdd} />);
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows reply button on comments', () => {
    render(<CommentThread comments={[comments[0]]} onAddComment={() => {}} />);
    expect(screen.getByRole('button', { name: 'Responder' })).toBeInTheDocument();
  });

  it('calls onDeleteComment when delete is clicked', () => {
    const onDelete = vi.fn();
    render(<CommentThread comments={[comments[0]]} onDeleteComment={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /Eliminar comentario de Ana/ }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
