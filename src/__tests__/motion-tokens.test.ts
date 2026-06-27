import { describe, it, expect } from 'vitest';
import { easing, durations, spring, transitions, variants } from '../motion/tokens';

describe('motion tokens', () => {
  it('easing curves are 4-point cubic-beziers', () => {
    for (const curve of Object.values(easing)) {
      expect(curve).toHaveLength(4);
      curve.forEach(n => expect(typeof n).toBe('number'));
    }
  });

  it('durations are non-negative seconds', () => {
    for (const d of Object.values(durations)) {
      expect(d).toBeGreaterThanOrEqual(0);
    }
    expect(durations.fast).toBeLessThan(durations.base);
    expect(durations.base).toBeLessThan(durations.reveal);
  });

  it('spring presets carry stiffness + damping', () => {
    for (const s of Object.values(spring)) {
      expect(s).toHaveProperty('stiffness');
      expect(s).toHaveProperty('damping');
    }
  });

  it('transition presets compose durations + easing', () => {
    expect(transitions.enter).toEqual({ duration: durations.base, ease: easing.out });
    expect(transitions.reveal).toEqual({ duration: durations.reveal, ease: easing.reveal });
    expect(transitions.overlay.duration).toBe(durations.fast);
  });

  it('fadeInUp variant slides from the given offset to zero', () => {
    const v = variants.fadeInUp(24);
    expect(v.hidden).toEqual({ opacity: 0, y: 24 });
    expect(v.visible).toEqual({ opacity: 1, y: 0 });
    expect(variants.fadeInUp().hidden.y).toBe(12); // default offset
  });

  it('overlay variant exposes hidden/visible/exit for AnimatePresence', () => {
    expect(variants.overlay).toHaveProperty('hidden');
    expect(variants.overlay).toHaveProperty('visible');
    expect(variants.overlay).toHaveProperty('exit');
  });
});
