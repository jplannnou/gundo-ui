import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PricingCard, type PricingFeature } from "../PricingCard";

const features: PricingFeature[] = [
  { text: "Acceso básico", included: true },
  { text: "Reportes avanzados", included: false },
  { text: "Soporte prioritario", included: true },
];

describe("PricingCard", () => {
  it("renders plan name", () => {
    render(<PricingCard name="Pro" price={29} />);
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("renders numeric price", () => {
    render(<PricingCard name="Pro" price={29} currency="€" />);
    expect(screen.getByText("€29")).toBeInTheDocument();
  });

  it('renders "Gratis" for price 0', () => {
    render(<PricingCard name="Free" price={0} />);
    expect(screen.getByText("Gratis")).toBeInTheDocument();
  });

  it("renders string price", () => {
    render(<PricingCard name="Enterprise" price="Contactar" />);
    expect(screen.getByText("Contactar")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <PricingCard name="Pro" price={29} description="Para equipos pequeños" />,
    );
    expect(screen.getByText("Para equipos pequeños")).toBeInTheDocument();
  });

  it("renders features list", () => {
    render(<PricingCard name="Pro" price={29} features={features} />);
    expect(screen.getByText("Acceso básico")).toBeInTheDocument();
    expect(screen.getByText("Reportes avanzados")).toBeInTheDocument();
  });

  it("renders badge", () => {
    render(<PricingCard name="Pro" price={29} badge="Más popular" />);
    expect(screen.getByText("Más popular")).toBeInTheDocument();
  });

  it("calls onSelect when CTA is clicked", () => {
    const onSelect = vi.fn();
    render(<PricingCard name="Pro" price={29} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Empezar" }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("disables CTA when ctaDisabled=true", () => {
    render(<PricingCard name="Pro" price={29} ctaDisabled />);
    expect(screen.getByRole("button", { name: "Empezar" })).toBeDisabled();
  });

  it("renders custom CTA label", () => {
    render(<PricingCard name="Pro" price={29} ctaLabel="Contratar ahora" />);
    expect(
      screen.getByRole("button", { name: "Contratar ahora" }),
    ).toBeInTheDocument();
  });

  it("has article role with label", () => {
    render(<PricingCard name="Pro" price={29} />);
    expect(
      screen.getByRole("article", { name: "Plan Pro" }),
    ).toBeInTheDocument();
  });
  /**
   * GUARDA: una prestacion GRADUADA no se tacha nunca.
   *
   * Un booleano no puede decir «3 dias». Antes de `value`, una oferta escalonada
   * solo se podia expresar mintiendo: marcada como incluida perdia el limite, y
   * marcada como no-incluida esta tarjeta la TACHABA — diciendole a quien esta a
   * punto de pagar que no tiene algo que si tiene. La mitad de las filas de la
   * oferta real de GUNDO son graduadas, y por eso este componente no lo usaba
   * nadie (0 consumidores medidos el 2-sep-2026 en gundo-ecommerce-ui).
   */
  describe("prestacion graduada (value)", () => {
    it("muestra el valor en vez del check", () => {
      render(
        <PricingCard
          name="Gratis"
          price={0}
          features={[
            { text: "Recetas nuevas", included: true, value: "3/semana" },
          ]}
        />,
      );
      expect(screen.getByText("3/semana")).toBeInTheDocument();
    });

    it("NO tacha la prestacion aunque included sea false", () => {
      const { container } = render(
        <PricingCard
          name="Gratis"
          price={0}
          features={[
            { text: "Plan personalizado", included: false, value: "3 dias" },
          ]}
        />,
      );
      const texto = screen.getByText(/Plan personalizado/);
      expect(texto.className).not.toContain("line-through");
      expect(container.querySelector(".line-through")).toBeNull();
    });

    it("sigue tachando lo que de verdad no esta incluido", () => {
      const { container } = render(
        <PricingCard
          name="Gratis"
          price={0}
          features={[{ text: "Escaner ilimitado", included: false }]}
        />,
      );
      expect(container.querySelector(".line-through")).not.toBeNull();
    });

    it("el valor llega al lector de pantalla, no solo a la pildora", () => {
      render(
        <PricingCard
          name="Gratis"
          price={0}
          features={[
            { text: "Recetas nuevas", included: true, value: "3/semana" },
          ]}
        />,
      );
      // El texto accesible del item incluye el valor: la pildora visual va
      // aria-hidden, asi que sin la copia oculta se leeria solo «Recetas nuevas».
      expect(screen.getByRole("listitem").textContent).toContain("3/semana");
    });
  });
});
