import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GundoWidget } from '../widget/GundoWidget';

const api = {
  apiBaseUrl: 'https://engine.example.test',
  project: 'layering-test',
  getToken: async () => 'test-token',
};

describe('GundoWidget stacking contract', () => {
  it('keeps the launcher clickable when a consumer omits the dock token', () => {
    render(<GundoWidget api={api} productName="Asistente Club C" />);

    expect(
      screen.getByRole('button', { name: 'Abrir Asistente Club C' }),
    ).toHaveStyle({ zIndex: 'var(--ui-z-dock, 300)' });
  });
});
