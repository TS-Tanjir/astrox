#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
exec node scripts/with-db.mjs next dev -p 3000 "$@"
