import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Pagination } from '../Pagination';

afterEach(cleanup);

describe('Pagination', () => {
  it('renders nothing for single page', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={() => {}} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders page buttons for multiple pages', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onPageChange when clicking a page', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    const prevBtn = screen.getAllByRole('button')[0];
    expect(prevBtn).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons[buttons.length - 1];
    expect(nextBtn).toBeDisabled();
  });

  it('shows total count info when provided', () => {
    const { container } = render(
      <Pagination page={2} totalPages={5} onPageChange={() => {}} total={50} pageSize={10} />,
    );
    // The <p> contains "11–20 of 50" across spans and text nodes
    const infoText = container.querySelector('p')!.textContent;
    expect(infoText).toContain('11');
    expect(infoText).toContain('20');
    expect(infoText).toContain('50');
  });
});
