/**
 * Tests de la guarda del design system.
 *
 * Los fixtures NO son inventados: son la forma literal que tenían los
 * package.json de `genie-ui`, `gundo-admin-fitness-ui`, `gundo-plataform-ui` y
 * `gundo-ecommerce-ui` en agosto de 2026, cuando se descubrió que había dos
 * copias del DS instaladas. Si esta suite pasa, la guarda habría puesto el
 * proceso en rojo el día que se introdujo la clave duplicada (PR #57).
 */

import { describe, it, expect } from 'vitest';

import {
  CANONICAL_ALIAS,
  PUBLISHED_NAME,
  DsGuardError,
  canonicalSpec,
  findDeclarations,
  auditConsumerManifest,
  assertCanonicalConsumer,
  rewriteAliasVersion,
} from '../ds-consumer-guard.mjs';

import {
  DsResolutionError,
  assertResolvedInstall,
} from '../verify-ds-resolution.mjs';

import { auditManifests, loadConsumers } from '../audit-ds-consumers.mjs';

/* ---------------------------- fixtures reales --------------------------- */

/** genie-ui, main @ 2026-08-15: alias 1.35.2 + nombre directo 1.26.2. */
const GENIE_UI_ROTO = {
  name: 'genie-ui',
  dependencies: {
    '@gundo/ui': 'npm:@jplannnou/gundo-ui@^1.35.2',
    '@jplannnou/gundo-ui': '^1.26.2',
    react: '^19.0.0',
  },
};

/** gundo-ecommerce-ui, main @ 2026-08-15: duplicada aunque coincida la versión. */
const ECOMMERCE_UI_ROTO = {
  name: 'gundo-ecommerce-ui',
  dependencies: {
    '@gundo/ui': 'npm:@jplannnou/gundo-ui@^1.37.2',
    '@jplannnou/gundo-ui': '^1.37.2',
  },
};

/** admin-fitness-ui tras el PR #131: una sola clave, la canónica. */
const ADMIN_FITNESS_SANO = {
  name: 'gundo-admin-fitness-ui',
  dependencies: { '@gundo/ui': 'npm:@jplannnou/gundo-ui@^1.35.2' },
};

/** Gundo_Engine: protocolo local, el bot no lo versiona. */
const ENGINE_FILE_PROTOCOL = {
  name: 'engine-frontend',
  dependencies: { '@gundo/ui': 'file:../../gundo-ui' },
};

describe('canonicalSpec', () => {
  it('normaliza cualquier forma de versión al alias canónico', () => {
    for (const input of ['1.37.2', 'v1.37.2', '^1.37.2', ' 1.37.2 ']) {
      expect(canonicalSpec(input)).toBe(`npm:${PUBLISHED_NAME}@^1.37.2`);
    }
  });

  it('rechaza versiones que no lo son', () => {
    expect(() => canonicalSpec('latest')).toThrow(DsGuardError);
    expect(() => canonicalSpec('')).toThrow(DsGuardError);
  });
});

describe('findDeclarations', () => {
  it('encuentra las dos claves del fallo real', () => {
    expect(findDeclarations(GENIE_UI_ROTO)).toEqual([
      { section: 'dependencies', key: CANONICAL_ALIAS, spec: 'npm:@jplannnou/gundo-ui@^1.35.2' },
      { section: 'dependencies', key: PUBLISHED_NAME, spec: '^1.26.2' },
    ]);
  });

  it('mira las cuatro secciones, no solo dependencies', () => {
    const pkg = {
      dependencies: { '@gundo/ui': 'npm:@jplannnou/gundo-ui@^1.37.2' },
      devDependencies: { '@jplannnou/gundo-ui': '^1.20.0' },
    };
    expect(findDeclarations(pkg)).toHaveLength(2);
  });
});

describe('la guarda falla cuando el problema existe', () => {
  it('🔴 genie-ui (alias 1.35.2 + directo 1.26.2) pone el proceso en rojo', () => {
    expect(() => assertCanonicalConsumer(GENIE_UI_ROTO, { label: 'genie-ui' })).toThrow(DsGuardError);

    let message = '';
    try {
      assertCanonicalConsumer(GENIE_UI_ROTO, { label: 'genie-ui' });
    } catch (error) {
      message = error.message;
    }
    // El mensaje tiene que decir QUÉ está duplicado y a qué versiones,
    // para que no haga falta ir a mirar el repo.
    expect(message).toContain('DUPLICATE_DECLARATION');
    expect(message).toContain('genie-ui');
    expect(message).toContain('npm:@jplannnou/gundo-ui@^1.35.2');
    expect(message).toContain('^1.26.2');
  });

  it('🔴 ecommerce-ui falla aunque las DOS claves apunten a la misma versión', () => {
    // Este es el caso traicionero: nadie ve un conflicto de versiones, pero
    // siguen siendo dos entradas y el propagate solo puede escribir en una.
    expect(() => assertCanonicalConsumer(ECOMMERCE_UI_ROTO, { label: 'ecommerce-ui' })).toThrow(
      /DUPLICATE_DECLARATION/,
    );
  });

  it('🔴 falla si la duplicidad está repartida entre dependencies y devDependencies', () => {
    const pkg = {
      dependencies: { '@gundo/ui': 'npm:@jplannnou/gundo-ui@^1.37.2' },
      devDependencies: { '@jplannnou/gundo-ui': '^1.30.0' },
    };
    expect(() => assertCanonicalConsumer(pkg, { label: 'mixto' })).toThrow(/DUPLICATE_DECLARATION/);
  });

  it('🔴 falla si un consumidor en file: además declara el nombre directo', () => {
    const pkg = {
      dependencies: { '@gundo/ui': 'file:../../gundo-ui', '@jplannnou/gundo-ui': '^1.35.2' },
    };
    expect(() => assertCanonicalConsumer(pkg, { label: 'feedback' })).toThrow(/DUPLICATE_DECLARATION/);
  });

  it('🔴 falla si solo se declara el nombre publicado, sin alias', () => {
    const pkg = { dependencies: { '@jplannnou/gundo-ui': '^1.37.2' } };
    expect(() => assertCanonicalConsumer(pkg, { label: 'legacy' })).toThrow(/BARE_PUBLISHED_NAME/);
  });

  it('🔴 falla si el alias apunta a otro paquete', () => {
    const pkg = { dependencies: { '@gundo/ui': 'npm:@otro/ui@^1.0.0' } };
    expect(() => assertCanonicalConsumer(pkg, { label: 'suplantado' })).toThrow(/ALIAS_TARGET_MISMATCH/);
  });
});

describe('la guarda NO falla cuando el consumidor está sano', () => {
  it('✅ alias canónico único pasa', () => {
    const result = assertCanonicalConsumer(ADMIN_FITNESS_SANO, { label: 'admin-fitness-ui' });
    expect(result.status).toBe('ok');
    expect(result.declaration.key).toBe(CANONICAL_ALIAS);
  });

  it('✅ consumidores en file:/link:/workspace: se saltan sin ruido', () => {
    for (const spec of ['file:../../gundo-ui', 'link:../gundo-ui', 'workspace:*']) {
      const result = auditConsumerManifest(
        { dependencies: { '@gundo/ui': spec } },
        { label: 'local' },
      );
      expect(result.status).toBe('skip');
      expect(result.violations).toHaveLength(0);
    }
  });

  it('✅ un repo que no usa el DS se salta', () => {
    expect(auditConsumerManifest({ dependencies: { react: '^19' } }).status).toBe('skip');
  });

  it('✅ Engine (file:) sigue saltándose como hasta ahora', () => {
    expect(auditConsumerManifest(ENGINE_FILE_PROTOCOL).status).toBe('skip');
  });
});

describe('rewriteAliasVersion — el propagate escribe SIEMPRE sobre el alias', () => {
  const raw = JSON.stringify(
    {
      name: 'consumer',
      dependencies: { '@gundo/ui': 'npm:@jplannnou/gundo-ui@^1.35.2', react: '^19.0.0' },
    },
    null,
    2,
  );

  it('sube la versión del alias y deja el resto del manifiesto intacto', () => {
    const { text, previous, spec, changed } = rewriteAliasVersion(raw, '1.38.0');
    expect(changed).toBe(true);
    expect(previous).toBe('npm:@jplannnou/gundo-ui@^1.35.2');
    expect(spec).toBe('npm:@jplannnou/gundo-ui@^1.38.0');
    expect(JSON.parse(text).dependencies['@gundo/ui']).toBe('npm:@jplannnou/gundo-ui@^1.38.0');
    expect(JSON.parse(text).dependencies.react).toBe('^19.0.0');
    // No reformatea: mismo número de líneas que el original.
    expect(text.split('\n')).toHaveLength(raw.split('\n').length);
  });

  it('es idempotente si ya está en la versión', () => {
    expect(rewriteAliasVersion(raw, '1.35.2').changed).toBe(false);
  });

  it('nunca escribe sobre el nombre directo — antes aborta', () => {
    const soloDirecto = JSON.stringify({ dependencies: { '@jplannnou/gundo-ui': '^1.26.2' } });
    expect(() => rewriteAliasVersion(soloDirecto, '1.38.0')).toThrow(/No se encontro la clave/);
  });
});

describe('assertResolvedInstall — el detector del no-op del PR #107', () => {
  it('🔴 caza "escribí 1.35.2 y el consumidor resuelve 1.26.2"', () => {
    let message = '';
    try {
      assertResolvedInstall({
        aliasManifest: { name: PUBLISHED_NAME, version: '1.26.2' },
        bareManifest: null,
        expected: '1.35.2',
        label: 'gundo-admin-fitness-ui',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(DsResolutionError);
      expect(error.code).toBe('RESOLVED_VERSION_MISMATCH');
      message = error.message;
    }
    expect(message).toContain('1.35.2');
    expect(message).toContain('1.26.2');
    expect(message).toContain('NO-OP');
  });

  it('🔴 caza las dos copias físicas desempaquetadas a la vez', () => {
    try {
      assertResolvedInstall({
        aliasManifest: { name: PUBLISHED_NAME, version: '1.35.2' },
        bareManifest: { name: PUBLISHED_NAME, version: '1.26.2' },
        expected: '1.35.2',
        label: 'genie-ui',
      });
      throw new Error('debería haber fallado');
    } catch (error) {
      expect(error.code).toBe('TWO_COPIES_INSTALLED');
    }
  });

  it('🔴 caza que el alias no llegara a instalarse', () => {
    try {
      assertResolvedInstall({ aliasManifest: null, bareManifest: null, expected: '1.37.2' });
      throw new Error('debería haber fallado');
    } catch (error) {
      expect(error.code).toBe('ALIAS_NOT_INSTALLED');
    }
  });

  it('✅ pasa cuando hay una sola copia en la versión propagada', () => {
    const result = assertResolvedInstall({
      aliasManifest: { name: PUBLISHED_NAME, version: '1.37.2' },
      bareManifest: null,
      expected: '^1.37.2',
      label: 'ok',
    });
    expect(result.version).toBe('1.37.2');
  });
});

describe('barrido de consumidores', () => {
  it('scripts/consumers.json es el registro de TODOS los repos que consumen el DS', () => {
    const consumers = loadConsumers();
    for (const consumer of consumers) {
      expect(consumer.repo).toMatch(/^[\w.-]+\/[\w.-]+$/);
      expect(typeof consumer.pkg_dir).toBe('string');
    }
    // Sin duplicados: dos entradas del mismo repo audirían dos veces y una de
    // ellas podría quedarse con un pkg_dir obsoleto.
    expect(new Set(consumers.map((c) => c.repo)).size).toBe(consumers.length);

    // Los que el bot versiona (los 4 del org por npm + los 6 en file:).
    const propagados = consumers.filter((c) => c.propagate !== false);
    expect(propagados).toHaveLength(10);
    expect(propagados.map((c) => c.repo)).toContain('Gundo-Health-and-Food/genie-ui');

    // Y los que consumen el DS sin que el bot los versione: el barrido de
    // higiene SÍ los mira, que es lo que impide que sean un punto ciego.
    const soloAuditados = consumers.filter((c) => c.propagate === false);
    expect(soloAuditados.map((c) => c.repo)).toEqual([
      'Gundo-Health-and-Food/gundo-internal-dashboard-ui',
      'Gundo-Health-and-Food/gundo-ocr-pwa',
    ]);
  });

  it('🔴 el barrido devuelve fallo en cuanto UN consumidor está duplicado', () => {
    const { failures, lines } = auditManifests([
      { label: 'admin-fitness-ui', pkg: ADMIN_FITNESS_SANO },
      { label: 'engine', pkg: ENGINE_FILE_PROTOCOL },
      { label: 'genie-ui', pkg: GENIE_UI_ROTO },
    ]);
    expect(failures).toHaveLength(1);
    expect(failures[0].label).toBe('genie-ui');
    expect(lines).toContain('[FAIL] genie-ui - DUPLICATE_DECLARATION');
  });

  it('✅ el barrido pasa limpio si todos son canónicos o file:', () => {
    const { failures } = auditManifests([
      { label: 'admin-fitness-ui', pkg: ADMIN_FITNESS_SANO },
      { label: 'engine', pkg: ENGINE_FILE_PROTOCOL },
    ]);
    expect(failures).toHaveLength(0);
  });
});
