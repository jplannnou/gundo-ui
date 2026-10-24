#!/usr/bin/env node
/**
 * Registro y selección de consumidores del design system.
 *
 * El registro conserva consumidores históricos, pero solo los de ciclo de
 * vida `active` pueden entrar en automatizaciones que leen o escriben repos.
 * La selección es pura para que publish y consumer-hygiene no puedan derivar.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const LIFECYCLES = new Set(['active', 'archived', 'migration-only']);

export function loadConsumers(path = join(here, 'consumers.json')) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Selecciona consumidores aptos para una automatización sin acceder a red.
 * Un ciclo de vida desconocido falla cerrado: nunca se trata como activo.
 */
export function selectConsumers(consumers, mode) {
  if (!['propagate', 'audit'].includes(mode)) {
    throw new Error(`UNKNOWN_CONSUMER_SELECTION_MODE: ${mode}`);
  }

  return consumers.filter((consumer) => {
    const lifecycle = consumer.lifecycle ?? 'active';
    if (!LIFECYCLES.has(lifecycle)) {
      throw new Error(`UNKNOWN_CONSUMER_LIFECYCLE: ${consumer.repo} -> ${lifecycle}`);
    }
    if (lifecycle !== 'active') return false;
    return mode === 'audit' || consumer.propagate !== false;
  });
}

if (process.argv[1] && process.argv[1].endsWith('consumer-lifecycle.mjs')) {
  const [mode] = process.argv.slice(2);
  process.stdout.write(JSON.stringify(selectConsumers(loadConsumers(), mode)));
}
