#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_PORT="${FRONTEND_PORT:-8081}"

export EXPO_PUBLIC_BACKEND_URL="${EXPO_PUBLIC_BACKEND_URL:-http://localhost:8001}"
export HOST="${HOST:-0.0.0.0}"
export EXPO_NO_TELEMETRY=1
export CI=1

cd "$ROOT_DIR/frontend"

exec yarn expo start --web --non-interactive --port "$FRONTEND_PORT"
