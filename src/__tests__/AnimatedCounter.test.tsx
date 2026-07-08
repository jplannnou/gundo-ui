import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Spy compartido para las llamadas a spring.set, expuesto vía vi.hoisted para
// poder leerlo tras mockear motion/react.
const { setSpy } = vi.hoisted(() => ({ setSpy: vi.fn() }));

// Mockeamos motion/react: el contador entra en viewport (useInView → true), el
// spring expone un .set espiable y el transform devuelve el string final. Así
// testeamos la lógica del efecto sin depender de IntersectionObserver / RAF.
vi.mock("motion/react", () => ({
  useInView: () => true,
  useSpring: () => ({ set: setSpy, get: () => 0 }),
  useTransform: (_spring: unknown, fn: (v: number) => string) => fn(0),
  motion: {
    span: ({ children, ...rest }: React.ComponentProps<"span">) => (
      <span {...rest}>{children}</span>
    ),
  },
}));

// useReducedMotion → false para ejercer la ruta animada (no el fallback directo).
vi.mock("../utils/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

import { AnimatedCounter } from "../motion/AnimatedCounter";

describe("AnimatedCounter", () => {
  beforeEach(() => setSpy.mockClear());

  it("anima al target inicial cuando entra en viewport", () => {
    render(<AnimatedCounter to={2} />);
    expect(setSpy).toHaveBeenCalledWith(2);
  });

  it("RE-anima cuando `to` cambia estando ya en viewport (dato async que llega tarde)", () => {
    const { rerender } = render(<AnimatedCounter to={2} />);
    expect(setSpy).toHaveBeenCalledWith(2);

    // El valor real llega después (p. ej. una query que resuelve): NO debe
    // quedarse congelado en el parcial.
    rerender(<AnimatedCounter to={4} />);
    expect(setSpy).toHaveBeenCalledWith(4);
  });
});
