#!/usr/bin/env node
/**
 * Guarda del design system en los consumidores.
 *
 * Contexto (ago-2026). Dos consumidores acabaron con DOS copias del DS
 * instaladas a la vez porque su package.json declaraba `@gundo/ui` dos veces:
 *
 *   "@gundo/ui":           "npm:@jplannnou/gundo-ui@^1.35.2"   <- alias canonico
 *   "@jplannnou/gundo-ui": "^1.26.2"                           <- nombre directo
 *
 * Las dos se importaban desde el codigo, asi que el bundle cargaba dos
 * ThemeProviders y dos juegos de tokens. La causa fue este mismo bot: hacia
 * `pnpm add @jplannnou/gundo-ui@^X`, que escribe UNA sola de las dos claves y
 * no siempre la misma. El caso extremo medido es el PR #107 de
 * `gundo-admin-fitness-ui`: se titulo "update @gundo/ui to ^1.35.2", escribio
 * en la clave que nadie importaba, la app siguio sirviendo 1.26.2 y el PR se
 * mergeo como si hubiera hecho algo. Un no-op silencioso.
 *
 * Este modulo impone la forma canonica del org -- el ALIAS -- y hace ruido
 * (exit != 0) en cuanto un consumidor se sale de ella. No avisa: rompe.
 *
 * Sin dependencias: solo builtins de Node, para poder correr antes de
 * cualquier `pnpm install` y tambien desde un runner limpio.
 */

import { readFileSync, writeFileSync } from 'node:fs';

/** Forma canonica del org: la clave que TODO consumidor debe declarar. */
export const CANONICAL_ALIAS = '@gundo/ui';

/** Nombre real del paquete publicado en GitHub Packages. */
export const PUBLISHED_NAME = '@jplannnou/gundo-ui';

const DEP_SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

/** Error de guarda: mensaje multilinea, pensado para leerse en un log rojo. */
export class DsGuardError extends Error {
  constructor(message, violations) {
    super(message);
    this.name = 'DsGuardError';
    this.violations = violations;
  }
}

/** `1.37.2` | `v1.37.2` | `^1.37.2` -> `npm:@jplannnou/gundo-ui@^1.37.2` */
export function canonicalSpec(version) {
  const clean = String(version).trim().replace(/^v/, '').replace(/^[\^~]/, '');
  if (!/^\d+\.\d+\.\d+/.test(clean)) {
    throw new DsGuardError(`Version invalida para el bump: "${version}"`, []);
  }
  return `npm:${PUBLISHED_NAME}@^${clean}`;
}

/** Todas las declaraciones del DS en el manifiesto, mirando las 4 secciones. */
export function findDeclarations(pkg) {
  const found = [];
  for (const section of DEP_SECTIONS) {
    const deps = pkg?.[section];
    if (!deps || typeof deps !== 'object') continue;
    for (const key of [CANONICAL_ALIAS, PUBLISHED_NAME]) {
      if (Object.prototype.hasOwnProperty.call(deps, key)) {
        found.push({ section, key, spec: String(deps[key]) });
      }
    }
  }
  return found;
}

const isFileProtocol = (spec) => /^(file:|link:|workspace:)/.test(spec);

/**
 * Audita un manifiesto de consumidor.
 * @returns {{status:'ok'|'skip', reason?:string, declaration?:object, violations:object[]}}
 */
export function auditConsumerManifest(pkg, { label = 'consumer' } = {}) {
  const declarations = findDeclarations(pkg);
  const violations = [];

  if (declarations.length === 0) {
    return { status: 'skip', reason: 'no-declara-@gundo/ui', violations };
  }

  // 1. EL FALLO. Mas de una declaracion = mas de una copia potencial del DS.
  //    Cubre tanto alias+nombre directo como el mismo nombre en dos secciones.
  if (declarations.length > 1) {
    const list = declarations.map((d) => `      - ${d.section}."${d.key}": "${d.spec}"`).join('\n');
    violations.push({
      code: 'DUPLICATE_DECLARATION',
      message: [
        `${label} declara el design system ${declarations.length} veces:`,
        list,
        '',
        '    Dos claves = dos copias instaladas = dos ThemeProviders y dos juegos',
        '    de tokens en el bundle. Ademas el auto-propagate solo puede escribir',
        '    en una de ellas, asi que la otra se queda congelada y el PR de bump',
        '    resulta ser un no-op silencioso (ver PR #107 de admin-fitness-ui).',
        '',
        '    Arreglo: deja SOLO la clave alias y migra los imports de',
        `    "${PUBLISHED_NAME}" a "${CANONICAL_ALIAS}".`,
        `      "${CANONICAL_ALIAS}": "npm:${PUBLISHED_NAME}@^X.Y.Z"`,
      ].join('\n'),
    });
  }

  const [decl] = declarations;

  // 2. Consumidores en `file:`/`link:` (Engine, Finance, Radar, jp-assistant,
  //    feedback, vida): no se versionan, el bot no los toca. Pero solo se
  //    saltan si estan limpios: si ademas duplican, ya cayo la violacion.
  if (declarations.length === 1 && isFileProtocol(decl.spec)) {
    return {
      status: 'skip',
      reason: `protocolo local (${decl.spec})`,
      declaration: decl,
      violations,
    };
  }

  // 3. Solo el nombre directo, sin alias. No es el fallo medido, pero es el
  //    manifiesto a un commit de distancia de serlo (asi nacio el PR #57), y
  //    el bot no debe taparlo escribiendo encima.
  if (declarations.length === 1 && decl.key === PUBLISHED_NAME) {
    violations.push({
      code: 'BARE_PUBLISHED_NAME',
      message: [
        `${label} declara el DS por su nombre publicado en vez de por el alias:`,
        `      ${decl.section}."${PUBLISHED_NAME}": "${decl.spec}"`,
        '',
        '    La forma canonica del org es el alias. Con el nombre directo, el dia',
        '    que alguien anada el alias tendras las dos claves y dos copias.',
        '',
        `    Arreglo: renombra la clave a "${CANONICAL_ALIAS}" con spec`,
        `    "npm:${PUBLISHED_NAME}@^X.Y.Z" y actualiza los imports.`,
      ].join('\n'),
    });
  }

  // 4. El alias existe pero apunta a otro paquete.
  if (
    declarations.length === 1 &&
    decl.key === CANONICAL_ALIAS &&
    !isFileProtocol(decl.spec) &&
    !decl.spec.startsWith(`npm:${PUBLISHED_NAME}@`)
  ) {
    violations.push({
      code: 'ALIAS_TARGET_MISMATCH',
      message: [
        `${label} usa el alias "${CANONICAL_ALIAS}" apuntando a algo que no es el DS:`,
        `      ${decl.section}."${CANONICAL_ALIAS}": "${decl.spec}"`,
        '',
        `    Se esperaba "npm:${PUBLISHED_NAME}@^X.Y.Z".`,
      ].join('\n'),
    });
  }

  return { status: 'ok', declaration: decl, violations };
}

/** Igual que `auditConsumerManifest` pero lanza si hay violaciones. */
export function assertCanonicalConsumer(pkg, { label = 'consumer' } = {}) {
  const result = auditConsumerManifest(pkg, { label });
  if (result.violations.length > 0) {
    throw new DsGuardError(formatViolations(label, result.violations), result.violations);
  }
  return result;
}

export function formatViolations(label, violations) {
  return [
    '',
    '  [FAIL] GUARDA DEL DESIGN SYSTEM: manifiesto de consumidor no canonico',
    `  [FAIL] ${label}`,
    '',
    ...violations.map((v) => `  [${v.code}]\n    ${v.message}\n`),
    '  Este proceso falla a proposito. No lo silencies: arregla el consumidor.',
    '',
  ].join('\n');
}

/**
 * Reescribe la version del alias sobre el TEXTO del manifiesto.
 *
 * Se hace por texto y no con JSON.stringify a proposito: el bot edita repos
 * ajenos y no debe reformatearles el package.json entero (diff ilegible y
 * ruido en la review). Presupone manifiesto ya auditado: una sola declaracion.
 */
export function rewriteAliasVersion(raw, version) {
  const spec = canonicalSpec(version);
  const pattern = /("@gundo\/ui"\s*:\s*")([^"]*)(")/g;
  const matches = [...raw.matchAll(pattern)];

  if (matches.length === 0) {
    throw new DsGuardError(
      `No se encontro la clave "${CANONICAL_ALIAS}" en el manifiesto; no hay donde escribir el bump.`,
      [],
    );
  }
  if (matches.length > 1) {
    throw new DsGuardError(
      `La clave "${CANONICAL_ALIAS}" aparece ${matches.length} veces en el manifiesto. Ambiguo: aborta.`,
      [],
    );
  }

  const [, , previous] = matches[0];
  const next = raw.replace(pattern, `$1${spec}$3`);
  return { text: next, previous, spec, changed: previous !== spec };
}

/* ------------------------------- CLI ------------------------------------ */

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const opts = {};
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i].startsWith('--')) {
      const key = rest[i].slice(2);
      opts[key] = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[(i += 1)] : 'true';
    }
  }
  return { command, opts };
}

function emitOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`, { flag: 'a' });
  }
}

function main(argv) {
  const { command, opts } = parseArgs(argv);
  const pkgPath = opts.pkg;
  const label = opts.label ?? pkgPath ?? 'consumer';

  if (!command || !pkgPath) {
    console.error(
      'uso: ds-consumer-guard.mjs <audit|bump> --pkg <package.json> [--label <repo>] [--version <x.y.z>]',
    );
    process.exit(2);
  }

  const raw = readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);

  if (command === 'audit') {
    let result;
    try {
      result = assertCanonicalConsumer(pkg, { label });
    } catch (error) {
      console.error(error.message);
      emitOutput('skip', 'false');
      process.exit(1);
    }
    if (result.status === 'skip') {
      console.info(`[skip] ${label}: ${result.reason}`);
      emitOutput('skip', 'true');
      return;
    }
    console.info(`[ok]   ${label}: alias canonico -> "${result.declaration.spec}"`);
    emitOutput('skip', 'false');
    return;
  }

  if (command === 'bump') {
    assertCanonicalConsumer(pkg, { label });
    const { text, previous, spec, changed } = rewriteAliasVersion(raw, opts.version);
    if (changed) writeFileSync(pkgPath, text);
    console.info(
      changed
        ? `[ok]   ${label}: "${CANONICAL_ALIAS}" ${previous} -> ${spec}`
        : `[skip] ${label}: ya estaba en ${spec}`,
    );
    emitOutput('changed', String(changed));
    return;
  }

  console.error(`Comando desconocido: ${command}`);
  process.exit(2);
}

if (process.argv[1] && process.argv[1].endsWith('ds-consumer-guard.mjs')) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof DsGuardError ? error.message : error);
    process.exit(1);
  }
}
