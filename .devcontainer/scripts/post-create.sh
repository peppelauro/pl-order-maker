#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$ROOT_DIR"

corepack enable

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
fi

python -m pip install --user -r backend/requirements.txt

cd frontend
yarn install
