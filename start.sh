#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
exec node scripts/with-db.mjs next start -p 3000 "$@"
