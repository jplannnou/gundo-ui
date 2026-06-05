import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Barrido a11y COMPLETO del design system — los 84 componentes del gallery
 * (vs los 31 curados de a11y.spec.ts). SIN exclusiones de contraste: queremos
 * la verdad. Cada test SIEMPRE pasa (solo recolecta); el resultado real va a
 * a11y-full-report.json. Pinpointea el origen de T-SYS-1 (color-contrast ×93
 * en apps) a nivel componente. El gallery YA procesa Tailwind (@tailwindcss/vite).
 */
const NAMES = fs
  .readFileSync(path.resolve(__dirname, 'all-components.txt'), 'utf-8')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

interface NodeDetail { target: string; fg?: string; bg?: string; ratio?: number; summary?: string }
interface Finding {
  component: string;
  theme: string;
  violations: { id: string; impact: string; nodes: number; details?: NodeDetail[] }[];
}
const findings: Finding[] = [];

for (const name of NAMES) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${name} · ${theme}`, async ({ page }) => {
      await page.goto(`/#/${name}`, { waitUntil: 'domcontentloaded' });
      if (theme === 'light') {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      }
      await page.waitForTimeout(400);
      // The visual harness renders `Component "X" not found.` for any component
      // without a showcase. Counting that error <p> as a color-contrast failure
      // is a false positive — record it as skipped so the report reflects real
      // coverage, not harness gaps. (T-SYS-1b: add the missing showcases.)
      const notRendered = await page
        .locator('p', { hasText: 'not found.' })
        .count()
        .then((c) => c > 0)
        .catch(() => false);
      if (notRendered) {
        findings.push({ component: name, theme, violations: [{ id: 'skipped-no-showcase', impact: 'n/a', nodes: 0 }] });
        return;
      }
      let res;
      try {
        res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      } catch (e) {
        findings.push({ component: name, theme, violations: [{ id: 'axe-error', impact: 'unknown', nodes: 0 }] });
        return;
      }
      findings.push({
        component: name,
        theme,
        violations: res.violations.map((v) => ({
          id: v.id,
          impact: v.impact ?? 'n/a',
          nodes: v.nodes.length,
          // For color-contrast, capture the offending element + measured colors
          // so the report is actionable (which token vs which surface). Other
          // rules just keep the count.
          details:
            v.id === 'color-contrast'
              ? v.nodes.slice(0, 5).map((n) => {
                  const cc = [...(n.any ?? []), ...(n.all ?? [])].find(
                    (c) => c.id === 'color-contrast',
                  );
                  const d = (cc?.data ?? {}) as {
                    fgColor?: string;
                    bgColor?: string;
                    contrastRatio?: number;
                  };
                  return {
                    target: Array.isArray(n.target) ? n.target.join(' ') : String(n.target),
                    fg: d.fgColor,
                    bg: d.bgColor,
                    ratio: d.contrastRatio,
                    summary: (n.failureSummary ?? '').replace(/\s+/g, ' ').slice(0, 200),
                  };
                })
              : undefined,
        })),
      });
      expect(true).toBe(true); // siempre pasa — recolección, no gate
    });
  }
}

test.afterAll(() => {
  const isSkip = (f: Finding) =>
    f.violations.length === 1 && f.violations[0].id === 'skipped-no-showcase';
  const skipped = [...new Set(findings.filter(isSkip).map((f) => f.component))].sort();
  const withViol = findings.filter((f) => f.violations.length && !isSkip(f));
  // Agregado por regla axe (qué tan sistémico es cada problema).
  const byRule: Record<string, { components: Set<string>; nodes: number }> = {};
  for (const f of withViol)
    for (const v of f.violations) {
      (byRule[v.id] ??= { components: new Set(), nodes: 0 });
      byRule[v.id].components.add(f.component);
      byRule[v.id].nodes += v.nodes;
    }
  const rules = Object.entries(byRule)
    .map(([id, d]) => ({ rule: id, components: [...d.components].sort(), componentCount: d.components.size, totalNodes: d.nodes }))
    .sort((a, b) => b.componentCount - a.componentCount);
  const report = {
    generatedAt: new Date().toISOString(),
    componentsTested: NAMES.length,
    componentsRendered: NAMES.length - skipped.length,
    componentsSkippedNoShowcase: skipped.length,
    componentsWithViolations: new Set(withViol.map((f) => f.component)).size,
    skipped,
    byRule: rules,
    findings: withViol,
  };
  fs.writeFileSync(path.resolve(__dirname, 'a11y-full-report.json'), JSON.stringify(report, null, 2));
  /* eslint-disable no-console */
  console.log('\n──────── DESIGN SYSTEM a11y COMPLETO ────────');
  console.log(`  ${NAMES.length} componentes · ${report.componentsRendered} renderizados · ${skipped.length} sin showcase (skip) · ${report.componentsWithViolations} con violaciones reales`);
  for (const r of rules) console.log(`  · ${r.rule} → ${r.componentCount} componentes, ${r.totalNodes} nodos`);
  console.log('  → e2e/a11y/a11y-full-report.json\n');
  /* eslint-enable no-console */
});
