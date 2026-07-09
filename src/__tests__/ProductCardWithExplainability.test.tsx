import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProductCardWithExplainability } from "../ProductCardWithExplainability";

const product = {
  ean: "8411000000001",
  name: "Pan integral de espelta",
  brand: "Ametller",
  price: 2.49,
  matchScore: 85,
  reasons: [
    {
      reason: "Alto en fibra, apto para tu microbiota",
      tags: ["microbiota" as const],
    },
  ],
};

describe("ProductCardWithExplainability", () => {
  it("renders product name and price", () => {
    render(<ProductCardWithExplainability product={product} />);
    expect(screen.getByText("Pan integral de espelta")).toBeInTheDocument();
    expect(screen.getByText(/€2\.49/)).toBeInTheDocument();
  });

  it("renders explainability badge", () => {
    render(<ProductCardWithExplainability product={product} />);
    expect(screen.getByText(/Alto en fibra/)).toBeInTheDocument();
  });

  it("derives match state and shows label", () => {
    render(<ProductCardWithExplainability product={product} />);
    expect(screen.getByText("Compatible con vos")).toBeInTheDocument();
  });

  it("disables add-to-cart when incompatible", () => {
    const onAddToCart = vi.fn();
    render(
      <ProductCardWithExplainability
        product={{ ...product, matchScore: 10 }}
        onAddToCart={onAddToCart}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /no recomendado/i }));
    expect(onAddToCart).not.toHaveBeenCalled();
  });

  it("calls onAddToCart for matches", () => {
    const onAddToCart = vi.fn();
    render(
      <ProductCardWithExplainability
        product={product}
        onAddToCart={onAddToCart}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Añadir/ }));
    expect(onAddToCart).toHaveBeenCalledWith(product.ean);
  });

  it("matchScoreColor overrides ONLY the ring color (no incompatible side-effects)", () => {
    const onAddToCart = vi.fn();
    const { container } = render(
      <ProductCardWithExplainability
        product={product}
        state="neutral"
        matchScoreColor="var(--ui-error)"
        onAddToCart={onAddToCart}
      />,
    );
    // Ring stroke uses the override color…
    expect(
      container.querySelector('circle[stroke="var(--ui-error)"]'),
    ).toBeTruthy();
    // …without any of the `incompatible` side-effects:
    expect(screen.queryByText("No recomendado")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Añadir/ }));
    expect(onAddToCart).toHaveBeenCalledWith(product.ean);
  });
});
