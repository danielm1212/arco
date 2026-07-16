#!/bin/sh
set -eu

umask 077

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_root="${BACKUP_ROOT:-$(pwd)/backups}"
destination="$backup_root/$stamp"
postgres_image="${ARCO_POSTGRES_IMAGE:-public.ecr.aws/supabase/postgres:17.6.1.136}"
supabase_cli="${SUPABASE_CLI_BIN:-supabase}"

mkdir -p "$destination"

if [ -n "${SUPABASE_DB_URL:-}" ]; then
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
elif command -v "$supabase_cli" >/dev/null 2>&1; then
  "$supabase_cli" db dump --linked --role-only --file "$destination/roles.sql" --yes
  "$supabase_cli" db dump --linked --file "$destination/schema.sql" --yes
  "$supabase_cli" db dump --linked --data-only --use-copy --file "$destination/data.sql" --yes

  test -s "$destination/roles.sql"
  test -s "$destination/schema.sql"
  test -s "$destination/data.sql"
  (
    cd "$destination"
    shasum -a 256 roles.sql schema.sql data.sql > manifest.sha256
  )
  chmod 600 "$destination/roles.sql" "$destination/schema.sql" "$destination/data.sql" "$destination/manifest.sha256"
else
  echo "Brak SUPABASE_DB_URL i Supabase CLI. Ustaw connection string albo SUPABASE_CLI_BIN." >&2
  exit 1
fi

echo "✅ Kopia bazy gotowa i zweryfikowana: $destination"
