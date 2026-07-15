import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Pagination } from '../Pagination';
import { StepIndicator } from '../StepIndicator';
import { BottomBar } from '../BottomBar';
import { FloatingActionButton } from '../FloatingActionButton';

/**
 * TD-009 regression. White ink on the dark theme's semantic colours fails WCAG:
 * those tokens are tuned to be readable AS TEXT ON the dark surface, which makes
 * them light — and therefore bad AS BACKGROUNDS under white. Measured on dark:
 * white on primary #67C728 = 2.15:1, on success #22c55e = 2.28:1, on error
 * #f87171 = 2.77:1. --ui-surface flips with the theme, so it clears AA on both
 * grounds (primary: 6.35:1 dark / 8.71:1 light).
 *
 * The exception is --ui-gradient (PaywallUnified): it does NOT flip, so its ink
 * must not either — surface-dark on the gradient's blue end is 1.41:1.
 */
describe('semantic backgrounds ink with the theme surface, not white', () => {
  it('Pagination: the active page', () => {
    const { container } = render(
      <Pagination page={1} totalPages={3} onPageChange={() => {}} />,
    );
    const active = container.querySelector('[aria-current="page"]') as HTMLElement;
    expect(active.className).toContain('gu-bg-primary');
    expect(active.className).toContain('gu-text-surface');
    expect(active.className).not.toContain('text-white');
  });

  it('StepIndicator: a completed step', () => {
    const { container } = render(
      <StepIndicator
        steps={[{ label: 'A' }, { label: 'B' }]}
        currentStep={1}
      />,
    );
    const filled = Array.from(container.querySelectorAll('div')).find(el =>
      el.className.includes('gu-bg-primary'),
    );
    expect(filled).toBeTruthy();
    expect(filled!.className).toContain('gu-text-surface');
    expect(filled!.className).not.toContain('text-white');
  });

  // The two error badges carry 9-10px bold text, where white's 2.77:1 hurts most.
  // BottomBar is `md:hidden fixed` (mobile-only) so the 1280px visual harness
  // can never snapshot it — this is its only guard.
  it('BottomBar: the notification badge', () => {
    const { container } = render(
      <BottomBar
        items={[
          { label: 'Inicio', icon: <span>i</span>, to: '/', active: true },
          { label: 'Avisos', icon: <span>a</span>, to: '/avisos', badge: 4 },
        ]}
      />,
    );
    const badge = Array.from(container.querySelectorAll('span')).find(el =>
      el.className.includes('gu-bg-error'),
    );
    expect(badge).toBeTruthy();
    expect(badge!.className).toContain('gu-text-surface');
    expect(badge!.className).not.toContain('text-white');
  });

  it('FloatingActionButton: the count badge', () => {
    const { container } = render(
      <FloatingActionButton icon={<span>+</span>} label="Add" badge={3} fixed={false} />,
    );
    const badge = Array.from(container.querySelectorAll('span')).find(el =>
      el.className.includes('gu-bg-error'),
    );
    expect(badge).toBeTruthy();
    expect(badge!.className).toContain('gu-text-surface');
    expect(badge!.className).not.toContain('text-white');
  });
});
