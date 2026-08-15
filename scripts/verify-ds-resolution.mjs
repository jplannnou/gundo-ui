#!/usr/bin/env node
/**
 * Verificador post-install: lo que se escribio, ¿es lo que el consumidor
 * REALMENTE resuelve?
 *
 * Esta es la mitad de la guarda que habria cazado el PR #107 de
 * `gundo-admin-fitness-ui`. Aquel PR se titulo "update @gundo/ui to ^1.35.2",
 * escribio en `@jplannnou/gundo-ui` (la clave que nadie importaba), y la app
 * siguio sirviendo 1.26.2. El diff era verde, el titulo mentia, y nadie tenia
 * forma de saberlo mirando el PR.
 *
 * Auditar el manifiesto no basta: hay que mirar el arbol instalado. Despues
 * del `pnpm install` este script comprueba dos cosas sobre node_modules:
 *
 *   1. Que exista UNA sola copia del DS en la raiz (si ademas esta
 *      `@jplannnou/gundo-ui` desempaquetado aparte, hay dos copias reales:
 *      dos ThemeProviders, dos juegos de tokens).
 *   2. Que la version resuelta sea EXACTAMENTE la que se acaba de propagar.
 *
 * Sin dependencias: solo builtins de Node.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const CANONICAL_ALIAS = '@gundo/ui';
export const PUBLISHED_NAME = '@jplannnou/gundo-ui';

export class DsResolutionError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'DsResolutionError';
    this.code = code;
  }
}

/**
 * Nucleo puro y testeable de la verificacion.
 *
 * @param {object} input
 * @param {{name?:string, version?:string}|null} input.aliasManifest package.json de node_modules/@gundo/ui
 * @param {{name?:string, version?:string}|null} input.bareManifest  package.json de node_modules/@jplannnou/gundo-ui
 * @param {string} input.expected version que el propagate acaba de escribir
 * @param {string} [input.label]
 */
export function assertResolvedInstall({ aliasManifest, bareManifest, expected, label = 'consumer' }) {
  const want = String(expected).trim().replace(/^v/, '').replace(/^[\^~]/, '');

  if (!aliasManifest) {
    throw new DsResolutionError(
      [
        '',
        '  [FAIL] GUARDA DEL DESIGN SYSTEM: el alias no resuelve a nada',
        `  [FAIL] ${label}`,
        '',
        `    Tras el install no existe node_modules/${CANONICAL_ALIAS}.`,
        '    Se escribio una version en el manifiesto y el arbol instalado no la',
        '    refleja: el bump no hizo nada.',
        '',
      ].join('\n'),
      'ALIAS_NOT_INSTALLED',
    );
  }

  // Dos copias fisicas del DS desempaquetadas a la vez.
  if (bareManifest) {
    throw new DsResolutionError(
      [
        '',
        '  [FAIL] GUARDA DEL DESIGN SYSTEM: DOS copias instaladas',
        `  [FAIL] ${label}`,
        '',
        `    node_modules/${CANONICAL_ALIAS}           -> ${aliasManifest.version}`,
        `    node_modules/${PUBLISHED_NAME}  -> ${bareManifest.version}`,
        '',
        '    El bundle va a cargar dos ThemeProviders y dos juegos de tokens.',
        '    Es exactamente el fallo de genie-ui y admin-fitness-ui (ago-2026).',
        '',
        `    Arreglo: una sola declaracion, la del alias "${CANONICAL_ALIAS}".`,
        '',
      ].join('\n'),
      'TWO_COPIES_INSTALLED',
    );
  }

  if (aliasManifest.name && aliasManifest.name !== PUBLISHED_NAME) {
    throw new DsResolutionError(
      [
        '',
        '  [FAIL] GUARDA DEL DESIGN SYSTEM: el alias resuelve a otro paquete',
        `  [FAIL] ${label}: node_modules/${CANONICAL_ALIAS} es "${aliasManifest.name}", se esperaba "${PUBLISHED_NAME}".`,
        '',
      ].join('\n'),
      'ALIAS_TARGET_MISMATCH',
    );
  }

  // El no-op del #107: se escribio X, el consumidor sirve Y.
  if (aliasManifest.version !== want) {
    throw new DsResolutionError(
      [
        '',
        '  [FAIL] GUARDA DEL DESIGN SYSTEM: se escribio una version y se resuelve otra',
        `  [FAIL] ${label}`,
        '',
        `    escrito en el manifiesto : ^${want}`,
        `    resuelto en node_modules : ${aliasManifest.version}`,
        '',
        '    El bump es un NO-OP: el PR diria que sube el DS y el consumidor',
        '    seguiria sirviendo la version vieja. Asi se mergeo el PR #107 de',
        '    admin-fitness-ui sin que nadie lo notara.',
        '',
        '    Causas tipicas: otra clave declara el DS y gana; un override o una',
        '    resolution lo pinea; el lockfile no se regenero.',
        '',
      ].join('\n'),
      'RESOLVED_VERSION_MISMATCH',
    );
  }

  return { version: aliasManifest.version };
}

function readManifest(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** Lee el arbol instalado en `dir` y aplica la verificacion. */
export function verifyInstalledTree({ dir, expected, label = dir }) {
  return assertResolvedInstall({
    aliasManifest: readManifest(join(dir, 'node_modules', CANONICAL_ALIAS, 'package.json')),
    bareManifest: readManifest(join(dir, 'node_modules', PUBLISHED_NAME, 'package.json')),
    expected,
    label,
  });
}

/* ------------------------------- CLI ------------------------------------ */

if (process.argv[1] && process.argv[1].endsWith('verify-ds-resolution.mjs')) {
  const opts = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      opts[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[(i += 1)] : 'true';
    }
  }
  const target = opts.dir ?? '.';
  const label = opts.label ?? target;
  if (!opts.expect) {
    console.error('uso: verify-ds-resolution.mjs --dir <consumerDir> --expect <x.y.z> [--label <repo>]');
    process.exit(2);
  }
  try {
    const { version } = verifyInstalledTree({ dir: target, expected: opts.expect, label });
    console.info(`[ok]   ${label}: una sola copia del DS, resuelta a ${version}`);
  } catch (error) {
    console.error(error.message ?? error);
    process.exit(1);
  }
}
