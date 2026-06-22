#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$ROOT_DIR/backend"

export MONGO_URL="${MONGO_URL:-mongodb://mongo:27017}"
export DB_NAME="${DB_NAME:-sales_order_db}"

PYTHON_BIN="$ROOT_DIR/backend/.venv/bin/python"
if [ ! -x "$PYTHON_BIN" ]; then
  PYTHON_BIN="python"
fi

exec "$PYTHON_BIN" -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
