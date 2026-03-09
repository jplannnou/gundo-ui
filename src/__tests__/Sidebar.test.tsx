import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarItem, SidebarToggle } from '../Sidebar';

describe('Sidebar', () => {
  it('renders children', () => {
    render(<Sidebar><SidebarContent><p>Nav items</p></SidebarContent></Sidebar>);
    expect(screen.getByText('Nav items')).toBeInTheDocument();
  });

  it('renders header', () => {
    render(<Sidebar><SidebarHeader>Logo</SidebarHeader><SidebarContent><p>Nav</p></SidebarContent></Sidebar>);
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup label="Menu">
            <SidebarItem label="Dashboard" active />
            <SidebarItem label="Settings" />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('marks active item', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem label="Home" active />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
    // Active item should have aria-current
    const btn = screen.getByRole('button', { name: /home/i });
    expect(btn).toHaveAttribute('aria-current', 'page');
  });

  it('calls onClick on item click', () => {
    const onClick = vi.fn();
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem label="Click me" onClick={onClick} />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });

  it('has aside element', () => {
    const { container } = render(
      <Sidebar>
        <SidebarContent><p>Nav</p></SidebarContent>
      </Sidebar>
    );
    expect(container.querySelector('aside')).toBeTruthy();
  });
});
