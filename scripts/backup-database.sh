#!/bin/sh
set -eu

umask 077

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Brak SUPABASE_DB_URL. Ustaw connection string z Supabase Dashboard > Connect." >&2
  exit 1
fi

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_root="${BACKUP_ROOT:-$(pwd)/backups}"
destination="$backup_root/$stamp"
postgres_image="${ARCO_POSTGRES_IMAGE:-public.ecr.aws/supabase/postgres:17.6.1.136}"

mkdir -p "$destination"

docker run --rm \
  --env SUPABASE_DB_URL \
  --volume "$destination:/backup" \
  "$postgres_image" \
  sh -c 'pg_dump "$SUPABASE_DB_URL" --format=custom --compress=9 --no-owner --no-privileges --exclude-schema=realtime --exclude-schema=_realtime --file=/backup/database.dump'

docker run --rm \
  --volume "$destination:/backup:ro" \
  "$postgres_image" \
  pg_restore --list /backup/database.dump >/dev/null

(
  cd "$destination"
  shasum -a 256 database.dump > manifest.sha256
)

chmod 600 "$destination/database.dump" "$destination/manifest.sha256"
echo "✅ Kopia bazy gotowa i zweryfikowana: $destination"
