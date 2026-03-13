import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar, type FilterGroup } from '../FilterBar';

const filters: FilterGroup[] = [
  {
    id: 'category',
    label: 'Categoría',
    options: [
      { value: 'fruits', label: 'Frutas', count: 10 },
      { value: 'vegs', label: 'Verduras', count: 5 },
    ],
  },
  {
    id: 'brand',
    label: 'Marca',
    mode: 'single',
    options: [
      { value: 'gundo', label: 'Gundo' },
      { value: 'other', label: 'Otra' },
    ],
  },
];

describe('FilterBar', () => {
  it('renders filter group buttons', () => {
    render(<FilterBar filters={filters} />);
    expect(screen.getByRole('button', { name: /Categoría/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Marca/ })).toBeInTheDocument();
  });

  it('opens dropdown when filter button is clicked', () => {
    render(<FilterBar filters={filters} />);
    fireEvent.click(screen.getByRole('button', { name: /Categoría/ }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Frutas')).toBeInTheDocument();
    expect(screen.getByText('Verduras')).toBeInTheDocument();
  });

  it('shows option counts', () => {
    render(<FilterBar filters={filters} />);
    fireEvent.click(screen.getByRole('button', { name: /Categoría/ }));
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calls onFilterChange when option is clicked', () => {
    const onFilterChange = vi.fn();
    render(<FilterBar filters={filters} onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Categoría/ }));
    fireEvent.click(screen.getByText('Frutas'));
    expect(onFilterChange).toHaveBeenCalledWith('category', ['fruits']);
  });

  it('renders search input when searchable=true', () => {
    render(<FilterBar filters={filters} searchable />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('calls onSearchChange on input', () => {
    const onSearchChange = vi.fn();
    render(<FilterBar filters={filters} searchable onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'test' } });
    expect(onSearchChange).toHaveBeenCalledWith('test');
  });

  it('renders active filter pills', () => {
    render(
      <FilterBar
        filters={filters}
        activeFilters={{ category: ['fruits'] }}
        onFilterChange={() => {}}
      />,
    );
    expect(screen.getByText('Frutas')).toBeInTheDocument();
  });

  it('shows clear all button when there are active filters and onClearAll is provided', () => {
    render(
      <FilterBar
        filters={filters}
        activeFilters={{ category: ['fruits'] }}
        onFilterChange={() => {}}
        onClearAll={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Limpiar todo' })).toBeInTheDocument();
  });

  it('calls onClearAll when clear button is clicked', () => {
    const onClearAll = vi.fn();
    render(
      <FilterBar
        filters={filters}
        activeFilters={{ category: ['fruits'] }}
        onFilterChange={() => {}}
        onClearAll={onClearAll}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar todo' }));
    expect(onClearAll).toHaveBeenCalledOnce();
  });
});
