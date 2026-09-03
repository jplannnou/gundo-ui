import { describe, it, expect } from "vitest";

/**
 * TRINQUETE DE COPY DEL DESIGN SYSTEM — dos reglas, una dura y una que aprieta.
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 * El 3-sep-2026 se encontró **voseo servido en producción**: la ficha de
 * producto V2 (`ProductCardWithExplainability`) pintaba «Compatible con v-o-s»
 * en `ultrapersonalizacion.gundo.life`. Verificado en el bundle vivo, no
 * deducido. Había dos casos más (`MagicLinkAuth`, `ChatHistorySection`).
 *
 * El hook `check-voseo` de la máquina de JP solo mira los ficheros que se
 * editan, así que una cadena escrita hace meses en OTRO repo nunca pasa por él.
 * Esta guarda sí: mira el design system entero en cada `pnpm test`.
 *
 * Y de paso mide la razón por la que media superficie premium del DS no se
 * adopta: **un componente con un idioma dentro no lo puede usar una app que
 * sale en siete**. Medido el 3-sep-2026 sobre `gundo-ecommerce-ui`:
 * `PricingCard`, `SubscriptionGate`, `FreemiumBanner` y `ExplainabilityBadge`
 * tienen CERO consumidores, teniendo esa app landing de precios, puerta premium
 * y modelo freemium.
 *
 * ── Cómo se usa ────────────────────────────────────────────────────────────
 * · VOSEO: cero tolerancia, no hay lista. Si salta, se corrige.
 * · CASTELLANO CLAVADO: lista EXACTA, no un contador — un contador deja pasar
 *   «quito uno aquí y meto otro allá». Si haces traducible un componente
 *   (texto por prop, con o sin valor por defecto), BORRA su línea. La lista solo
 *   encoge. Y si añades un componente nuevo, no la amplíes: exponé el texto como
 *   prop desde el principio.
 */

/**
 * ⚠️ Se lee con `import.meta.glob` y NO con `node:fs`: este paquete no tiene
 * `@types/node`, asi que `tsc --noEmit` falla al importarlo. Vite inlinea las
 * fuentes en tiempo de compilacion del test, que para un trinquete estatico es
 * exactamente lo mismo.
 */
const FUENTES = import.meta.glob("../**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/**
 * Rioplatense. Solo formas inequívocas: nada que pueda ser otra palabra
 * ("mira" sin tilde es indicativo, "acá" sí es marcador claro).
 *
 * ⚠️ Lookarounds y NO ``. En JavaScript `` se define sobre
 * `[A-Za-z0-9_]`, así que una vocal acentuada NO es carácter de palabra: en
 * «entrá » no hay frontera detrás de la `á` y `/entrá/` no casa NUNCA.
 * Casi todas las formas de voseo acaban en vocal acentuada, o sea que con ``
 * esta guarda pasaba en verde sin comprobar nada. Verificado mordiendo.
 */
const VOSEO =
  /(?<![\wáéíóúüñ])(?:entrá|tenés|podés|querés|sabés|hacé|mirá|elegí|guardá|escribí|reservá|contanos|tocá|consultá|disfrutá|sumate|registrate|creá|probá|descubrí|empezá|andá|acá|vos|tuyo tuya)(?![\wáéíóúüñ])/i;

/** Palabras que en un literal delatan copy de cara al usuario en castellano. */
const CASTELLANO =
  /(?<![\wáéíóúüñ])(?:actualizar|actualiza|desbloquea|desbloquear|plan|planes|precio|gratis|mes|año|analítica|más|tu|tus|para|todas|funciones|empezar|cargando|guardar|guardados|cancelar|siguiente|anterior|buscar|cerrar|aceptar|elegir|ver|aquí|racha|comida|producto|resultado|imagen|semana|cambios|contenido|sangre|orina|subir|clic|editar|email|contraseñas|segundos|esenciales|sitio|publicidad|compatible|recomendado|contigo|charlas|conversaciones|comidas|puntos|nivel)(?![\wáéíóúüñ])/i;

function sinComentarios(codigo: string): string {
  return codigo.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
}

/** Literales que pueden ser texto visible: no slugs, ni clases, ni rutas. */
function literales(codigo: string): string[] {
  const out: string[] = [];
  for (const m of sinComentarios(codigo).matchAll(
    /'([^'\n]{3,80})'|"([^"\n]{3,80})"/g,
  )) {
    const v = m[1] ?? m[2];
    if (!v) continue;
    if (/^[a-z0-9-]+$/.test(v)) continue;
    if (
      /[{}<>#]|\bgu-|\bflex\b|\brounded|\btext-|\bmt-|\bpx-|\bw-|\bh-/.test(v)
    )
      continue;
    if (/^https?:|^\.{0,2}\//.test(v)) continue;
    out.push(v);
  }
  return out;
}

const FICHEROS = Object.entries(FUENTES)
  .filter(
    ([ruta]) =>
      !ruta.includes("/__tests__/") && !/\.(test|spec|d)\./.test(ruta),
  )
  .map(([ruta, codigo]) => ({
    rel: ruta.replace(/^\.\.\//, ""),
    codigo,
  }));

/**
 * Componentes que HOY llevan castellano clavado. Medido el 3-sep-2026.
 * Hacerlos traducibles es sacar el texto a una prop; esta lista es el
 * inventario para hacerlo, y solo puede encoger.
 */
const CON_CASTELLANO = new Set([
  "CalendarGrid.tsx",
  "ChatHistorySection.tsx",
  "ChatSection.tsx",
  "CheckinWizard.tsx",
  "CookieBanner.tsx",
  "ExplainabilityBadge.tsx",
  "FilterBar.tsx",
  "GamificationWidget.tsx",
  "GundoWidget.tsx",
  "ImageGallery.tsx",
  "InlineEdit.tsx",
  "LoadingSkeletonVariants.tsx",
  "MagicLinkAuth.tsx",
  "MealCard.tsx",
  "MealDetailTabs.tsx",
  "NotificationCard.tsx",
  "PaywallUnified.tsx",
  "PricingCard.tsx",
  "ProductCardWithExplainability.tsx",
  "RecipeReasoningPills.tsx",
  "SaveBar.tsx",
  "SenderIdentity.tsx",
  "StepWizard.tsx",
  "StreakCard.tsx",
  "SubscriptionGate.tsx",
  "UploadWizard.tsx",
]);

describe("copy del design system", () => {
  it("encuentro los ficheros de verdad", () => {
    // Auto-validación: sin esto, un barrido roto deja todo lo de abajo pasando
    // sobre una lista vacía.
    expect(FICHEROS.length).toBeGreaterThan(100);
  });

  it("NADA de voseo rioplatense — ni en valores por defecto", () => {
    const culpables: string[] = [];
    for (const { rel, codigo } of FICHEROS)
      for (const lit of literales(codigo))
        if (VOSEO.test(lit)) culpables.push(`${rel}: ${JSON.stringify(lit)}`);
    expect(
      culpables,
      "todo el copy de GUNDO va en español neutro con «tú». Esto ya se sirvió " +
        "en producción una vez (3-sep-2026, ficha de producto V2):\n  " +
        culpables.join("\n  "),
    ).toEqual([]);
  });

  it("el castellano clavado no crece ni deja fantasmas", () => {
    const medidos = new Set<string>();
    for (const { rel, codigo } of FICHEROS) {
      const nombre = rel.split("/").pop()!;
      if (literales(codigo).some((l) => CASTELLANO.test(l)))
        medidos.add(nombre);
    }
    const nuevos = [...medidos].filter((f) => !CON_CASTELLANO.has(f)).sort();
    const arreglados = [...CON_CASTELLANO]
      .filter((f) => !medidos.has(f))
      .sort();

    expect(
      nuevos,
      "componentes NUEVOS con texto en castellano dentro:\n  " +
        nuevos.join("\n  ") +
        "\n\nUn componente con un idioma dentro no lo puede consumir una app " +
        "que sale en 7. Saca el texto a una prop.",
    ).toEqual([]);

    expect(
      arreglados,
      "estos ya no tienen castellano clavado — borra sus líneas de " +
        "CON_CASTELLANO:\n  " +
        arreglados.join("\n  ") +
        "\n\nUna deuda que se queda escrita después de pagarla deja de medir nada.",
    ).toEqual([]);
  });
});
