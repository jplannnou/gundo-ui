import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

import {
  assertSafeInputs,
  collectFileChanges,
  resetBranchToBase,
  upsertPullRequest,
} from '../create-signed-consumer-pr.mjs';

const httpError = (status) => Object.assign(new Error(`GitHub ${status}`), { status });

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

describe('bump que reemplaza al anterior (una rama y un PR por consumidor)', () => {
  const target = { owner: 'o', repo: 'r', branch: 'chore/update-gundo-ui', baseOid: 'abc' };

  it('reinicia con force la rama existente en vez de crear otra', async () => {
    const calls = [];
    const call = async (url, init = {}) => {
      calls.push([init.method ?? 'GET', url, init.body]);
      return {};
    };

    await expect(resetBranchToBase(call, target)).resolves.toBe('reset');
    expect(calls).toEqual([
      [
        'PATCH',
        'https://api.github.com/repos/o/r/git/refs/heads/chore/update-gundo-ui',
        JSON.stringify({ sha: 'abc', force: true }),
      ],
    ]);
  });

  it('crea la rama solo si no existía', async () => {
    const calls = [];
    const call = async (url, init = {}) => {
      calls.push(init.method ?? 'GET');
      if (init.method === 'PATCH') throw httpError(422);
      return {};
    };

    await expect(resetBranchToBase(call, target)).resolves.toBe('created');
    expect(calls).toEqual(['PATCH', 'POST']);
  });

  it('propaga cualquier otro error en vez de tragárselo', async () => {
    const call = async () => {
      throw httpError(403);
    };
    await expect(resetBranchToBase(call, target)).rejects.toMatchObject({ status: 403 });
  });

  it('edita el PR abierto de la rama en vez de abrir otro', async () => {
    const calls = [];
    const call = async (url, init = {}) => {
      calls.push([init.method ?? 'GET', url]);
      if (!init.method) return [{ number: 7 }];
      return { html_url: 'https://github.com/o/r/pull/7' };
    };

    const { pull, replaced } = await upsertPullRequest(call, {
      ...target,
      base: 'main',
      title: 't',
      body: 'b',
    });

    expect(replaced).toBe(true);
    expect(pull.html_url).toMatch(/pull\/7$/);
    expect(calls.map(([method]) => method)).toEqual(['GET', 'PATCH']);
    expect(calls[1][1]).toBe('https://api.github.com/repos/o/r/pulls/7');
  });

  it('abre el PR si no hay ninguno abierto en esa rama', async () => {
    const calls = [];
    const call = async (url, init = {}) => {
      calls.push(init.method ?? 'GET');
      return init.method ? { html_url: 'https://github.com/o/r/pull/8' } : [];
    };

    const { replaced } = await upsertPullRequest(call, { ...target, base: 'main', title: 't', body: 'b' });

    expect(replaced).toBe(false);
    expect(calls).toEqual(['GET', 'POST']);
  });
});

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
