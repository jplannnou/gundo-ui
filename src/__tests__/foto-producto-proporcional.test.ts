/// <reference types="vite/client" />
import { describe, it, expect } from "vitest";

/**
 * GUARDA: la caja de una foto de producto es PROPORCIONAL, nunca de alto fijo.
 *
 * ESTE FALLO HA ENTRADO DOS VECES. Se arregló en la tarjeta del consumidor, con
 * el razonamiento escrito al lado, y la reescritura a
 * `ProductCardWithExplainability` lo volvió a meter — porque la lección vivía
 * solo en un comentario del componente que se sustituyó.
 *
 * POR QUÉ IMPORTA. La misma tarjeta se pinta en columnas muy distintas. En la
 * parrilla de productos del ecom (`max-w-6xl`, `p-4`,
 * `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, `gap-3 sm:gap-4`) la columna
 * mide, exactamente:
 *
 *     360px  ->  (360-32-12)/2  = 158px
 *     768px  ->  (768-32-32)/3  = 235px
 *    1024px  ->  (1024-32-48)/4 = 236px
 *   >=1280px ->  (1152-32-48)/4 = 268px
 *
 * Con el alto CLAVADO en `h-44` (176px) y `object-cover`, la foto —cuyo origen
 * es 400x300, o sea 4:3— se recortaba distinto en cada ancho:
 *
 *     158x176  = 0,90:1  ->  se pierde el 33 % del ANCHO de la foto
 *     235x176  = 1,33:1  ->  no se pierde nada (coincidencia)
 *     268x176  = 1,52:1  ->  se pierde el 12 % del ALTO
 *
 * Es decir: en el móvil, que es donde se compra, un tercio de la foto del
 * producto no se ve. Con `aspect-[4/3]` el alto lo pone la columna y la
 * relación no cambia nunca.
 *
 * Y no es un intercambio contra el CLS: la relación de aspecto reserva el
 * espacio igual de bien que el alto fijo.
 *
 * Si nace una tarjeta con foto, su caja lleva `aspect-`. Esta lista no se
 * amplía con excepciones: se arregla la tarjeta.
 */

// Se leen las fuentes por el bundler (no por `node:fs`): el DS es una librería
// de navegador y no lleva @types/node — misma razón que en aria-prohibida.
const FUENTES = import.meta.glob("../*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Las tarjetas que pintan una foto de producto. Solo crece si nace otra. */
const TARJETAS = ["ProductCard.tsx", "ProductCardWithExplainability.tsx"];

/**
 * La caja de la foto es la que lleva el fondo del hueco
 * (`gu-bg-surface-raised`). Anclar en `overflow-hidden` a secas cazaba también
 * la raíz de la tarjeta, que sí puede —y debe— recortar sin declarar ratio.
 */
const CLASES = /className=\{?(?:`[^`]*`|"[^"]*"|'[^']*')/g;
const ES_CAJA_FOTO = /\bgu-bg-surface-raised\b/;

function cuerpoSinComentarios(tarjeta: string): string {
  const clave = Object.keys(FUENTES).find((k) => k.endsWith("/" + tarjeta));
  if (!clave) throw new Error(`no encuentro la fuente de ${tarjeta}`);
  return FUENTES[clave].replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
}

describe("la foto de un producto escala con su columna", () => {
  for (const tarjeta of TARJETAS) {
    it(`${tarjeta} no fija el alto de la caja de la foto`, () => {
      const cuerpo = cuerpoSinComentarios(tarjeta);
      const cajas = (cuerpo.match(CLASES) ?? []).filter((c) =>
        ES_CAJA_FOTO.test(c),
      );
      expect(
        cajas.length,
        `${tarjeta}: no encuentro la caja de la foto`,
      ).toBeGreaterThan(0);
      for (const caja of cajas) {
        expect(
          /\bh-\d+\b|\bh-\[\d+px\]/.test(caja),
          `${tarjeta}: la caja de la foto fija el alto -> ${caja}\n` +
            "Usa aspect-[4/3] (la relación nativa del origen 400x300).",
        ).toBe(false);
        expect(
          /\baspect-/.test(caja),
          `${tarjeta}: la caja de la foto no declara relación de aspecto -> ${caja}`,
        ).toBe(true);
      }
    });

    it(`${tarjeta} no deja un emoji haciendo de hueco de foto`, () => {
      // Lo pinta la fuente del sistema: distinto en iOS, en Android y en
      // Windows, sin obedecer al tema y sin escalar con la tarjeta.
      const emoji =
        cuerpoSinComentarios(tarjeta).match(/[\u{1F300}-\u{1FAFF}]/gu) ?? [];
      expect(emoji, `${tarjeta} pinta emoji: ${emoji.join(" ")}`).toEqual([]);
    });
  }

  it("una foto que falla no deja el icono roto del navegador", () => {
    // Vienen de los CDN de las enseñas: una URL caduca, da 403 o muere. Sin
    // `onError` quedaba el icono roto del navegador dentro de la tarjeta.
    expect(
      /onError=/.test(
        cuerpoSinComentarios("ProductCardWithExplainability.tsx"),
      ),
    ).toBe(true);
  });
});
