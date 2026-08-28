import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

import {
  assertSafeInputs,
  collectFileChanges,
} from '../create-signed-consumer-pr.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'gundo-signed-pr-'));
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: root });
  writeFileSync(join(root, 'package.json'), '{"version":"1"}\n');
  writeFileSync(join(root, 'delete.txt'), 'old\n');
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'fixture'], { cwd: root });
  return root;
}

describe('signed consumer PR payload', () => {
  it('incluye cambios, archivos nuevos y eliminaciones con contenido base64', () => {
    const root = fixture();
    writeFileSync(join(root, 'package.json'), '{"version":"2"}\n');
    writeFileSync(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
    execFileSync('git', ['rm', '-q', 'delete.txt'], { cwd: root });

    const changes = collectFileChanges(root);

    expect(changes.additions.map(({ path }) => path)).toEqual(['package.json', 'pnpm-lock.yaml']);
    expect(Buffer.from(changes.additions[0].contents, 'base64').toString()).toContain('"2"');
    expect(changes.deletions).toEqual([{ path: 'delete.txt' }]);
  });

  it('falla cerrado ante rutas, ramas o repositorios inseguros', () => {
    const valid = {
      repository: 'Gundo-Health-and-Food/app',
      branch: 'chore/update-ui-1.2.3',
      base: 'main',
      fileChanges: { additions: [{ path: 'package.json', contents: 'e30=' }], deletions: [] },
    };

    expect(() => assertSafeInputs(valid)).not.toThrow();
    expect(() => assertSafeInputs({ ...valid, branch: '../main' })).toThrow(/branch inválida/);
    expect(() =>
      assertSafeInputs({
        ...valid,
        fileChanges: { additions: [{ path: '../secret', contents: 'eA==' }], deletions: [] },
      }),
    ).toThrow(/fuera del worktree/);
  });
});
