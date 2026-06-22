#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$ROOT_DIR"

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
fi

mkdir -p /tmp/pl-order-maker
