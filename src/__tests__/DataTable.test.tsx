import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTable } from '../DataTable';

interface Row { id: number; name: string; email: string }

const columns = [
  { key: 'name', header: 'Name', render: (row: Row) => row.name },
  { key: 'email', header: 'Email', render: (row: Row) => row.email },
];

const data: Row[] = [
  { id: 1, name: 'Alice', email: 'alice@test.com' },
  { id: 2, name: 'Bob', email: 'bob@test.com' },
];

describe('DataTable', () => {
  it('renders headers', () => {
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<DataTable columns={columns} data={[]} rowKey={(r: Row) => r.id} emptyMessage="No users" />);
    expect(screen.getByText('No users')).toBeInTheDocument();
  });

  it('calls onRowClick', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('sorts on Enter key on sortable header', () => {
    const sortableColumns = [
      { key: 'name', header: 'Name', render: (row: Row) => row.name, sortable: true },
      { key: 'email', header: 'Email', render: (row: Row) => row.email },
    ];
    const onSort = vi.fn();
    render(<DataTable columns={sortableColumns} data={data} rowKey={(r) => r.id} onSort={onSort} />);
    const nameHeader = screen.getByText('Name').closest('th')!;
    fireEvent.keyDown(nameHeader, { key: 'Enter' });
    expect(onSort).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  });

  it('has aria-sort attribute on sortable headers', () => {
    const sortableColumns = [
      { key: 'name', header: 'Name', render: (row: Row) => row.name, sortable: true },
      { key: 'email', header: 'Email', render: (row: Row) => row.email },
    ];
    render(
      <DataTable
        columns={sortableColumns}
        data={data}
        rowKey={(r) => r.id}
        onSort={() => {}}
        sort={{ key: 'name', direction: 'asc' }}
      />,
    );
    const nameHeader = screen.getByText('Name').closest('th')!;
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('checkboxes have aria-label', () => {
    const selectedKeys = new Set<string | number>();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        selectedKeys={selectedKeys}
        onSelectChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Select all')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Select row')).toHaveLength(2);
  });
});
