/// <reference types="vite/client" />
import { describe, it, expect } from "vitest";

/**
 * Los assets de marca tienen que salir publicados de verdad.
 *
 * POR QUÉ EXISTE ESTA GUARDA. Los cuatro SVG del logotipo se vectorizaron y se
 * mergearon a `main` el 3-ago-2026, y durante casi un mes **no llegaron a
 * ningún producto**: `files` publicaba solo `["dist","src"]`, así que `assets/`
 * se quedaba fuera del paquete. Un asset que está en el repositorio parece
 * disponible, y nadie mira el `files` hasta que alguien intenta importarlo.
 *
 * Y no basta con `files`: este paquete declara un mapa `exports` cerrado, que
 * bloquea cualquier subruta que no esté listada aunque el archivo sí viaje
 * dentro del tarball. Hacen falta las dos cosas, y por eso se comprueban las
 * dos.
 */

// Se leen las fuentes por el bundler (no por `node:fs`): el DS es una librería
// de navegador y no lleva @types/node — mismo motivo que en `aria-prohibida`.
const MANIFIESTO = import.meta.glob("../../package.json", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

const VECTORES = import.meta.glob("../../assets/brand/*.svg", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

const nombre = (ruta: string) => ruta.split("/").pop() ?? ruta;

describe("assets de marca", () => {
  const pkg = JSON.parse(Object.values(MANIFIESTO)[0]) as {
    files: string[];
    exports: Record<string, unknown>;
  };

  it("la carpeta assets entra en el paquete publicado", () => {
    expect(pkg.files).toContain("assets");
  });

  it("el mapa exports deja alcanzar las subrutas de assets", () => {
    // Sin esta entrada, `import '@gundo/ui/assets/brand/gundo-logo.svg'` falla
    // con ERR_PACKAGE_PATH_NOT_EXPORTED aunque el archivo esté en el tarball.
    expect(pkg.exports).toHaveProperty("./assets/*");
  });

  it("los cuatro vectores de marca siguen ahí", () => {
    expect(Object.keys(VECTORES).map(nombre).sort()).toEqual([
      "gundo-isotipo-adaptive.svg",
      "gundo-isotipo.svg",
      "gundo-logo-adaptive.svg",
      "gundo-logo.svg",
    ]);
  });

  it("son vectoriales de verdad, no un ráster envuelto en un SVG", () => {
    for (const [ruta, svg] of Object.entries(VECTORES)) {
      expect(svg, `${nombre(ruta)} lleva un ráster incrustado`).not.toMatch(
        /<image|base64/,
      );
      expect(svg, `${nombre(ruta)} ha perdido el verde de marca`).toMatch(
        /#67C728/i,
      );
    }
  });

  it("las variantes adaptativas usan currentColor y las fijas no", () => {
    // La adaptativa sirve donde el SVG se incrusta EN LÍNEA y hereda el color
    // del documento. Dentro de un `<img>` no lo hereda —se resolvería a negro—,
    // y para eso están las fijas. Confundirlas deja el logotipo negro sobre
    // fondo negro, así que la diferencia se comprueba.
    for (const [ruta, svg] of Object.entries(VECTORES)) {
      if (nombre(ruta).includes("adaptive")) {
        expect(svg, `${nombre(ruta)} debería usar currentColor`).toMatch(
          /currentColor/,
        );
      } else {
        expect(svg, `${nombre(ruta)} no debería usar currentColor`).not.toMatch(
          /currentColor/,
        );
      }
    }
  });
});
