import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TreeView, type TreeNode } from '../TreeView';

const nodes: TreeNode[] = [
  {
    id: 'root1',
    label: 'Categoría A',
    children: [
      { id: 'child1', label: 'Subcategoría 1' },
      { id: 'child2', label: 'Subcategoría 2', disabled: true },
    ],
  },
  { id: 'root2', label: 'Categoría B' },
  { id: 'root3', label: 'Categoría C', badge: 5 },
];

describe('TreeView', () => {
  it('renders root nodes', () => {
    render(<TreeView nodes={nodes} />);
    expect(screen.getByText('Categoría A')).toBeInTheDocument();
    expect(screen.getByText('Categoría B')).toBeInTheDocument();
    expect(screen.getByText('Categoría C')).toBeInTheDocument();
  });

  it('renders as tree role', () => {
    render(<TreeView nodes={nodes} />);
    expect(screen.getByRole('tree', { name: 'Árbol de navegación' })).toBeInTheDocument();
  });

  it('renders treeitem roles', () => {
    render(<TreeView nodes={nodes} />);
    const items = screen.getAllByRole('treeitem');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('does not show children before expanding', () => {
    render(<TreeView nodes={nodes} />);
    expect(screen.queryByText('Subcategoría 1')).not.toBeInTheDocument();
  });

  it('expands node on click', () => {
    render(<TreeView nodes={nodes} />);
    fireEvent.click(screen.getByText('Categoría A'));
    expect(screen.getByText('Subcategoría 1')).toBeInTheDocument();
  });

  it('collapses expanded node on second click', () => {
    render(<TreeView nodes={nodes} />);
    fireEvent.click(screen.getByText('Categoría A'));
    expect(screen.getByText('Subcategoría 1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Categoría A'));
    expect(screen.queryByText('Subcategoría 1')).not.toBeInTheDocument();
  });

  it('calls onSelect when node is clicked', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={nodes} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Categoría B'));
    expect(onSelect).toHaveBeenCalledWith(nodes[1]);
  });

  it('calls onExpandChange when node with children is clicked', () => {
    const onExpandChange = vi.fn();
    render(<TreeView nodes={nodes} onExpandChange={onExpandChange} />);
    fireEvent.click(screen.getByText('Categoría A'));
    expect(onExpandChange).toHaveBeenCalledWith('root1', true);
  });

  it('renders with defaultExpanded', () => {
    render(<TreeView nodes={nodes} defaultExpanded={['root1']} />);
    expect(screen.getByText('Subcategoría 1')).toBeInTheDocument();
  });

  it('renders badge', () => {
    render(<TreeView nodes={nodes} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders disabled node as disabled button', () => {
    render(<TreeView nodes={nodes} defaultExpanded={['root1']} />);
    const disabledBtn = screen.getByText('Subcategoría 2').closest('button');
    expect(disabledBtn).toBeDisabled();
  });

  it('renders group role for children list', () => {
    render(<TreeView nodes={nodes} defaultExpanded={['root1']} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('marks selected node via aria-selected', () => {
    render(<TreeView nodes={nodes} selected="root2" />);
    const item = screen.getByRole('treeitem', { name: /Categoría B/ });
    expect(item).toHaveAttribute('aria-selected', 'true');
  });
});
