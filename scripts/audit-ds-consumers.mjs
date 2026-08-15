#!/usr/bin/env node
/**
 * Barrido de higiene: audita el package.json de TODOS los consumidores del DS
 * (`scripts/consumers.json`) contra la forma canonica y sale en rojo si alguno
 * declara el design system mas de una vez.
 *
 * Por que existe ademas de la guarda dentro del propagate: el propagate solo
 * corre cuando hay release. Si un consumidor se duplica la clave a mano (asi
 * empezo todo, PR #57 de genie-ui), pueden pasar semanas hasta el siguiente
 * release. Este barrido corre en cron y a mano, y falla el job: no escribe un
 * aviso en un log que nadie lee.
 *
 * Uso:
 *   GITHUB_TOKEN=... node scripts/audit-ds-consumers.mjs
 *   node scripts/audit-ds-consumers.mjs --local <ruta/package.json>   # fixture
 */

import { readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { auditConsumerManifest, formatViolations } from './ds-consumer-guard.mjs';

const here = dirname(fileURLToPath(import.meta.url));

export function loadConsumers(path = join(here, 'consumers.json')) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

async function fetchManifest({ repo, pkg_dir: pkgDir }, token) {
  const path = pkgDir && pkgDir !== '.' ? `${pkgDir}/package.json` : 'package.json';
  const headers = {
    accept: 'application/vnd.github.raw+json',
    'user-agent': 'gundo-ui-ds-guard',
  };
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, { headers });
  if (!response.ok) {
    throw new Error(`GET ${repo}/${path} -> ${response.status} ${response.statusText}`);
  }
  return JSON.parse(await response.text());
}

/** Audita una lista ya resuelta de manifiestos. Puro: testeable sin red. */
export function auditManifests(entries) {
  const failures = [];
  const lines = [];
  for (const { label, pkg } of entries) {
    const result = auditConsumerManifest(pkg, { label });
    if (result.violations.length > 0) {
      failures.push({ label, violations: result.violations });
      lines.push(`[FAIL] ${label} - ${result.violations.map((v) => v.code).join(', ')}`);
    } else if (result.status === 'skip') {
      lines.push(`[skip] ${label} - ${result.reason}`);
    } else {
      lines.push(`[ok]   ${label} - ${result.declaration.spec}`);
    }
  }
  return { failures, lines };
}

async function main() {
  const args = process.argv.slice(2);
  const localIndex = args.indexOf('--local');

  let entries;
  if (localIndex !== -1) {
    entries = args
      .slice(localIndex + 1)
      .filter((a) => !a.startsWith('--'))
      .map((path) => ({ label: path, pkg: JSON.parse(readFileSync(path, 'utf8')) }));
  } else {
    const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    entries = await Promise.all(
      loadConsumers().map(async (consumer) => ({
        label: consumer.repo,
        pkg: await fetchManifest(consumer, token),
      })),
    );
  }

  const { failures, lines } = auditManifests(entries);

  console.info(
    ['', '  Higiene del design system en consumidores', '', ...lines.map((l) => `  ${l}`), ''].join('\n'),
  );

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      ['### Higiene del design system', '', ...lines.map((l) => `- \`${l}\``), ''].join('\n'),
    );
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(formatViolations(failure.label, failure.violations));
    }
    console.error(
      `  ${failures.length} consumidor(es) declaran el design system de forma no canonica. Job en rojo a proposito.\n`,
    );
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('audit-ds-consumers.mjs')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
