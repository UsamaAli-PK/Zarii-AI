#!/bin/bash
set -e

echo "[post-merge] Installing dependencies..."
npm install --legacy-peer-deps --yes 2>/dev/null || true

echo "[post-merge] Done."
