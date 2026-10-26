#!/usr/bin/env bash
set -euo pipefail

# Resolve the project from this file, even when launched from another directory.
project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$project_dir"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are required. Install Node.js, then run this script again." >&2
  exit 1
fi

if [[ ! -x node_modules/.bin/expo ]]; then
  echo "Dependencies are missing. Run npm ci in $project_dir, then try again." >&2
  exit 1
fi

# Use 8082 because another project may already be using Expo's default 8081.
echo "Starting Project Fighter. Scan the QR code with Expo Go; press Ctrl+C to stop."
exec npm run start -- --go --port "${EXPO_PORT:-8082}" "$@"
