import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Accordion, AccordionItem } from '../Accordion';

describe('Accordion', () => {
  it('renders accordion items', () => {
    render(
      <Accordion>
        <AccordionItem id="a1" header="Section 1">Content 1</AccordionItem>
        <AccordionItem id="a2" header="Section 2">Content 2</AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('toggles aria-expanded on click', () => {
    render(
      <Accordion>
        <AccordionItem id="b1" header="Toggle Me">Hidden Content</AccordionItem>
      </Accordion>
    );
    const button = screen.getByRole('button', { name: /toggle me/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders defaultOpen item with aria-expanded=true', () => {
    render(
      <Accordion>
        <AccordionItem id="c1" header="Open Item" defaultOpen>Visible Content</AccordionItem>
      </Accordion>
    );
    const button = screen.getByRole('button', { name: /open item/i });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
