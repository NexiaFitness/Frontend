#!/usr/bin/env bash
# ci-local.sh — Réplica local del job "Build and Test" (.github/workflows/deploy.yml).
# Ejecutar desde frontend/: bash scripts/ci-local.sh  (o: pnpm run ci:local)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> pnpm --filter shared build"
pnpm --filter shared build

echo "==> pnpm --filter web exec tsc --noEmit"
pnpm --filter web exec tsc --noEmit

echo "==> pnpm --filter web lint"
pnpm --filter web lint

echo "==> pnpm --filter web test"
pnpm --filter web test

echo "==> pnpm --filter web build"
pnpm --filter web build

if [[ ! -f "apps/web/dist/index.html" ]]; then
  echo "ERROR: build artifacts missing (apps/web/dist/index.html)" >&2
  exit 1
fi

echo "OK: ci-local passed (parity with GitHub Actions Build and Test)"
