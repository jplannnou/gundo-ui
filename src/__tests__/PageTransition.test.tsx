import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { PageTransition } from "../motion/PageTransition";

/**
 * LA INVARIANTE ES QUE EL REPOSO SE VE.
 *
 * `PageTransition` era un `motion.div` con `initial={{opacity:0}}` →
 * `animate={{opacity:1}}`, o sea con el reposo INVISIBLE. El 03-sep-2026 eso
 * dejó una ruta entera de gundo-ecommerce-ui en blanco: React suspendió el
 * subárbol a media animación (lo oculta con `display:none !important`) y al
 * revelarlo la librería re-aplicó `initial` sin reanudar.
 *
 * Estos tests fijan la propiedad que lo impide: pase lo que pase con la
 * animación —que no exista la API, que no llegue a correr, que se cancele—, el
 * contenido tiene que quedar visible y sin `opacity` en línea.
 */

const mockReduced = vi.hoisted(() => ({ value: false }));
vi.mock("../utils/useReducedMotion", () => ({
  useReducedMotion: () => mockReduced.value,
}));

afterEach(() => {
  mockReduced.value = false;
  vi.restoreAllMocks();
});

describe("PageTransition", () => {
  it("no deja opacidad en línea cuando el navegador NO tiene Web Animations API", () => {
    // jsdom no implementa Element.animate: es exactamente el caso "la
    // animación no llega a correr", que antes dejaba la pantalla en blanco.
    render(
      <PageTransition>
        <p>contenido</p>
      </PageTransition>,
    );
    const content = screen.getByText("contenido");
    expect(content).toBeTruthy();
    const wrapper = content.parentElement as HTMLElement;
    expect(wrapper.style.opacity).toBe("");
    expect(wrapper.getAttribute("style")).toBeNull();
  });

  it("anima SIN `fill`, para que el estilo en reposo siga siendo el normal", () => {
    const animate = vi.fn(() => ({ cancel: vi.fn() }));
    // @ts-expect-error jsdom no declara animate; se inyecta para el test.
    Element.prototype.animate = animate;

    render(
      <PageTransition>
        <p>contenido</p>
      </PageTransition>,
    );

    expect(animate).toHaveBeenCalledTimes(1);
    const [keyframes, options] = animate.mock.calls[0] as unknown as [
      Keyframe[],
      KeyframeAnimationOptions,
    ];
    expect(keyframes[0].opacity).toBe(0);
    expect(keyframes[keyframes.length - 1].opacity).toBe(1);
    // `fill` haría que el keyframe inicial persistiera fuera de la ejecución:
    // justo el fallo que se está evitando.
    expect(options.fill).toBeUndefined();

    // @ts-expect-error se retira lo inyectado.
    delete Element.prototype.animate;
  });

  it("bajo prefers-reduced-motion no anima y el contenido se ve igual", () => {
    mockReduced.value = true;
    const animate = vi.fn(() => ({ cancel: vi.fn() }));
    // @ts-expect-error jsdom no declara animate; se inyecta para el test.
    Element.prototype.animate = animate;

    render(
      <PageTransition className="mi-clase">
        <p>contenido</p>
      </PageTransition>,
    );

    expect(animate).not.toHaveBeenCalled();
    const wrapper = screen.getByText("contenido").parentElement as HTMLElement;
    expect(wrapper.className).toBe("mi-clase");
    expect(wrapper.getAttribute("style")).toBeNull();

    // @ts-expect-error se retira lo inyectado.
    delete Element.prototype.animate;
  });
});
