#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="/tmp/pl-order-maker"
FRONTEND_PORT="${FRONTEND_PORT:-8081}"

mkdir -p "$RUNTIME_DIR"

if pgrep -f "uvicorn server:app --host 0.0.0.0 --port 8001 --reload" >/dev/null; then
  echo "Backend gia' in esecuzione su :8001"
else
  nohup bash "$ROOT_DIR/.devcontainer/scripts/start-backend.sh" \
    >"$RUNTIME_DIR/backend.log" 2>&1 &
  echo "Backend avviato. Log: $RUNTIME_DIR/backend.log"
fi

if pgrep -f "expo start --web --non-interactive --port $FRONTEND_PORT" >/dev/null; then
  echo "Frontend gia' in esecuzione su :$FRONTEND_PORT"
else
  nohup bash "$ROOT_DIR/.devcontainer/scripts/start-frontend.sh" \
    >"$RUNTIME_DIR/frontend.log" 2>&1 &
  echo "Frontend avviato su :$FRONTEND_PORT. Log: $RUNTIME_DIR/frontend.log"
fi
