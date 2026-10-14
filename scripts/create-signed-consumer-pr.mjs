#!/usr/bin/env node
/**
 * Opens a cross-repository consumer bump with a GitHub-verified commit.
 *
 * A local `git commit` made with a PAT is unsigned and cannot enter consumers
 * that enforce signed commits. GitHub's `createCommitOnBranch` mutation signs
 * server-created commits, so this script fails closed unless the resulting
 * commit is reported as verified before it opens the pull request.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.github.com';
const GRAPHQL = `${API}/graphql`;

function splitNull(buffer) {
  return buffer
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
}

function git(cwd, args) {
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: args.includes('-z') ? null : 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

export function collectFileChanges(worktree) {
  const cwd = resolve(worktree);
  const changed = splitNull(
    git(cwd, ['diff', '--no-renames', '--name-only', '--diff-filter=ACMRTUXB', '-z', 'HEAD', '--']),
  );
  const deleted = splitNull(
    git(cwd, ['diff', '--no-renames', '--name-only', '--diff-filter=D', '-z', 'HEAD', '--']),
  );
  const untracked = splitNull(git(cwd, ['ls-files', '--others', '--exclude-standard', '-z']));
  const deletedSet = new Set(deleted);
  const additions = [...new Set([...changed, ...untracked])]
    .filter((path) => !deletedSet.has(path))
    .sort()
    .map((path) => ({
      path,
      contents: readFileSync(resolve(cwd, path)).toString('base64'),
    }));

  return {
    additions,
    deletions: [...deletedSet].sort().map((path) => ({ path })),
  };
}

export function assertSafeInputs({ repository, branch, base, fileChanges }) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error(`Repositorio inválido: ${repository}`);
  for (const [label, value] of [
    ['branch', branch],
    ['base', base],
  ]) {
    if (!/^[\w./-]+$/.test(value) || value.includes('..')) {
      throw new Error(`${label} inválida: ${value}`);
    }
  }
  if (!fileChanges.additions.length && !fileChanges.deletions.length) {
    throw new Error('No hay cambios para propagar.');
  }
  for (const change of [...fileChanges.additions, ...fileChanges.deletions]) {
    if (change.path.startsWith('/') || change.path.split(/[\\/]/).includes('..')) {
      throw new Error(`Ruta fuera del worktree: ${change.path}`);
    }
  }
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, '');
    const value = argv[index + 1];
    if (!key || value === undefined) throw new Error(`Argumento incompleto: ${argv[index] ?? ''}`);
    options[key] = value;
  }
  for (const required of ['repo', 'base', 'branch', 'worktree', 'title', 'body-file', 'message']) {
    if (!options[required]) throw new Error(`Falta --${required}`);
  }
  return options;
}

async function request(token, url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...init.headers,
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(`GitHub ${response.status} ${response.statusText}: ${body?.message ?? text}`);
    error.status = response.status;
    throw error;
  }
  return body;
}

/**
 * Deja `branch` apuntando EXACTAMENTE a `baseOid`: la crea si no existe y, si ya
 * existe (bump anterior sin mergear), la reinicia con force. Es lo que hace que
 * cada release REEMPLACE al bump pendiente en vez de abrir una rama y un PR
 * nuevos por versión (151 PRs encadenados el 14-oct-2026).
 */
export async function resetBranchToBase(call, { owner, repo, branch, baseOid }) {
  const refs = `${API}/repos/${owner}/${repo}/git/refs`;
  try {
    // `branch` ya pasó assertSafeInputs (`[\w./-]`): no necesita codificarse.
    await call(`${refs}/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: baseOid, force: true }),
    });
    return 'reset';
  } catch (error) {
    if (error.status !== 404 && error.status !== 422) throw error;
  }
  await call(refs, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseOid }),
  });
  return 'created';
}

/** Actualiza el PR abierto de `branch` (título y cuerpo) o lo crea si no hay. */
export async function upsertPullRequest(call, { owner, repo, branch, base, title, body }) {
  const pulls = `${API}/repos/${owner}/${repo}/pulls`;
  const open = await call(
    `${pulls}?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}&base=${encodeURIComponent(base)}`,
  );
  if (Array.isArray(open) && open.length > 0) {
    const pull = await call(`${pulls}/${open[0].number}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, body }),
    });
    return { pull, replaced: true };
  }
  const pull = await call(pulls, {
    method: 'POST',
    body: JSON.stringify({ title, body, head: branch, base }),
  });
  return { pull, replaced: false };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const token = process.env.GH_TOKEN?.trim();
  if (!token) throw new Error('Falta GH_TOKEN.');

  const fileChanges = collectFileChanges(options.worktree);
  assertSafeInputs({
    repository: options.repo,
    branch: options.branch,
    base: options.base,
    fileChanges,
  });

  const [owner, repo] = options.repo.split('/');
  const baseRef = await request(
    token,
    `${API}/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(options.base)}`,
  );
  const baseOid = baseRef.object.sha;

  const call = (url, init) => request(token, url, init);
  const branchState = await resetBranchToBase(call, {
    owner,
    repo,
    branch: options.branch,
    baseOid,
  });

  const query = `
    mutation CreateSignedCommit($input: CreateCommitOnBranchInput!) {
      createCommitOnBranch(input: $input) {
        commit { oid url }
      }
    }
  `;
  const graph = await request(token, GRAPHQL, {
    method: 'POST',
    body: JSON.stringify({
      query,
      variables: {
        input: {
          branch: {
            repositoryNameWithOwner: options.repo,
            branchName: options.branch,
          },
          expectedHeadOid: baseOid,
          message: { headline: options.message },
          fileChanges,
        },
      },
    }),
  });
  if (graph.errors?.length) throw new Error(`GraphQL: ${graph.errors.map((e) => e.message).join('; ')}`);

  const commit = graph.data?.createCommitOnBranch?.commit;
  if (!commit?.oid) throw new Error('GitHub no devolvió el commit firmado.');
  const verification = await request(token, `${API}/repos/${owner}/${repo}/commits/${commit.oid}`);
  if (!verification.commit?.verification?.verified) {
    throw new Error(
      `Commit ${commit.oid} no verificado (${verification.commit?.verification?.reason ?? 'sin razón'}). No se abre PR.`,
    );
  }

  const { pull, replaced } = await upsertPullRequest(call, {
    owner,
    repo,
    branch: options.branch,
    base: options.base,
    title: options.title,
    body: readFileSync(resolve(options['body-file']), 'utf8'),
  });

  process.stdout.write(
    `${JSON.stringify({
      pullRequest: pull.html_url,
      commit: commit.oid,
      verified: true,
      branch: branchState,
      replacedExistingPr: replaced,
    })}\n`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
