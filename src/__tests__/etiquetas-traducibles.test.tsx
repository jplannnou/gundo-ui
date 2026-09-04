import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PaywallUnified } from '../PaywallUnified';
import { RewardsGallery } from '../RewardsGallery';

/**
 * GUARDA: que las etiquetas de `labels` LLEGUEN de verdad al DOM.
 *
 * Por qué existe. Una prop nueva puede quedarse a medio cablear —declarada en
 * la interfaz, aceptada por TypeScript, y sin leerse en el sitio donde se
 * pinta el texto—. Compila, el consumidor la pasa convencido de haberlo
 * traducido, y el usuario alemán sigue leyendo español. Construida ≠ conectada.
 *
 * Estos componentes son los dos que tenían texto español INCRUSTADO sin forma
 * de sustituirlo. Tres de las etiquetas son `aria-label`: no se ven en
 * pantalla, así que un repaso visual no las habría cazado nunca — y son justo
 * las que un lector de pantalla lee en voz alta.
 *
 * Cómo se lee un fallo aquí: si salta, el texto por defecto sigue ganando y la
 * app multiidioma NO puede traducir ese trozo.
 */

const pricing = { monthly: 9.99, yearly: 89, currency: 'EUR' as const };

describe('las etiquetas por defecto se pueden sustituir', () => {
  describe('PaywallUnified', () => {
    it('sustituye los tres aria-label, que es lo que oye un lector de pantalla', () => {
      render(
        <PaywallUnified
          trigger="analytics"
          onUpgrade={() => {}}
          pricing={pricing}
          onDismiss={() => {}}
          featureMatrix={[
            { feature: 'Etwas', free: true, premium: false },
          ]}
          labels={{
            close: 'Schließen',
            included: 'Enthalten',
            notIncluded: 'Nicht enthalten',
          }}
        />,
      );
      expect(screen.getByLabelText('Schließen')).toBeInTheDocument();
      expect(screen.getByLabelText('Enthalten')).toBeInTheDocument();
      expect(screen.getByLabelText('Nicht enthalten')).toBeInTheDocument();
      // y el castellano ya no está en ninguno de los tres
      expect(screen.queryByLabelText('Cerrar')).toBeNull();
      expect(screen.queryByLabelText('Incluido')).toBeNull();
      expect(screen.queryByLabelText('No incluido')).toBeNull();
    });

    it('sustituye el botón de descarte, el ciclo y las cabeceras', () => {
      render(
        <PaywallUnified
          trigger="recipes"
          onUpgrade={() => {}}
          pricing={pricing}
          onDismiss={() => {}}
          labels={{
            dismiss: 'Nicht jetzt',
            monthly: 'Monatlich',
            annual: (ahorro) => `Jährlich · -${ahorro}%`,
            featureColumn: 'Funktion',
            freeColumn: 'Kostenlos',
          }}
        />,
      );
      expect(screen.getByText('Nicht jetzt')).toBeInTheDocument();
      expect(screen.getByText('Monatlich')).toBeInTheDocument();
      expect(screen.getByText(/^Jährlich/)).toBeInTheDocument();
      expect(screen.getByText('Funktion')).toBeInTheDocument();
      expect(screen.getByText('Kostenlos')).toBeInTheDocument();
      expect(screen.queryByText('Ahora no')).toBeNull();
      expect(screen.queryByText('Mensual')).toBeNull();
    });

    it('la etiqueta anual RECIBE el ahorro, para poder ordenar la frase', () => {
      // 9,99 × 12 = 119,88 frente a 89 → 26 %. El idioma decide dónde va ese
      // número; por eso es una función y no una cadena con un hueco.
      const vistos: number[] = [];
      render(
        <PaywallUnified
          trigger="plan"
          onUpgrade={() => {}}
          pricing={pricing}
          labels={{
            annual: (ahorro) => {
              vistos.push(ahorro);
              return `spare ${ahorro}%`;
            },
          }}
        />,
      );
      expect(vistos).toContain(26);
      expect(screen.getByText('spare 26%')).toBeInTheDocument();
    });

    it('sin `labels` sigue saliendo el castellano por defecto', () => {
      render(
        <PaywallUnified
          trigger="scanner"
          onUpgrade={() => {}}
          pricing={pricing}
          onDismiss={() => {}}
        />,
      );
      expect(screen.getByText('Ahora no')).toBeInTheDocument();
      expect(screen.getByLabelText('Cerrar')).toBeInTheDocument();
    });
  });

  describe('RewardsGallery', () => {
    const rewards = [
      { id: 'a', name: 'Botella', pointsRequired: 500 },
      { id: 'b', name: 'Camiseta', pointsRequired: 999, isRedeemable: false },
    ];

    it('sustituye el aria-label de la región y los textos de la tarjeta', () => {
      render(
        <RewardsGallery
          rewards={rewards}
          pointsBalance={100}
          labels={{
            galleryLabel: 'Prämienkatalog',
            points: 'Punkte',
            redeem: 'Einlösen',
            lockedByTier: 'Für dein Level gesperrt',
          }}
        />,
      );
      expect(screen.getByLabelText('Prämienkatalog')).toBeInTheDocument();
      expect(screen.getAllByText('Punkte').length).toBe(2);
      expect(screen.getByText('Für dein Level gesperrt')).toBeInTheDocument();
      expect(screen.queryByLabelText('Catálogo de recompensas')).toBeNull();
      expect(screen.queryByText('Bloqueado por tu nivel')).toBeNull();
    });

    it('la etiqueta de puntos que faltan RECIBE cuántos faltan', () => {
      render(
        <RewardsGallery
          rewards={[{ id: 'a', name: 'Botella', pointsRequired: 500 }]}
          pointsBalance={120}
          labels={{ pointsShort: (faltan) => `noch ${faltan} Punkte` }}
        />,
      );
      expect(screen.getByText('noch 380 Punkte')).toBeInTheDocument();
    });

    it('sustituye el texto de carga y el de vacío', () => {
      const { rerender } = render(
        <RewardsGallery
          rewards={[]}
          pointsBalance={0}
          isLoading
          labels={{ loading: 'Wird geladen…' }}
        />,
      );
      expect(screen.getByText('Wird geladen…')).toBeInTheDocument();

      rerender(
        <RewardsGallery
          rewards={[]}
          pointsBalance={0}
          emptyMessage="Keine Prämien"
        />,
      );
      expect(screen.getByText('Keine Prämien')).toBeInTheDocument();
    });

    it('sin `labels` sigue saliendo el castellano por defecto', () => {
      render(<RewardsGallery rewards={rewards} pointsBalance={100} />);
      expect(screen.getByLabelText('Catálogo de recompensas')).toBeInTheDocument();
      expect(screen.getByText('Bloqueado por tu nivel')).toBeInTheDocument();
    });
  });
});
