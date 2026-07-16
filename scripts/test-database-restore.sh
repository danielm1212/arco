#!/bin/sh
set -eu

backup_path="${1:-}"
container="${LOCAL_DB_CONTAINER:-supabase_db_arco}"

if [ -z "$backup_path" ] || { [ ! -f "$backup_path" ] && [ ! -d "$backup_path" ]; }; then
  echo "Użycie: npm run test:restore -- /pełna/ścieżka/database.dump-lub-katalogu-backupu" >&2
  exit 1
fi

stamp="$(date -u +%Y%m%d%H%M%S)"
test_db="arco_restore_${stamp}_$$"
container_backup="/tmp/${test_db}_backup"

cleanup() {
  docker exec "$container" dropdb -U supabase_admin --if-exists "$test_db" >/dev/null 2>&1 || true
  docker exec "$container" rm -rf "$container_backup" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker exec "$container" mkdir -p "$container_backup"
docker exec "$container" createdb -U supabase_admin "$test_db"

if [ -d "$backup_path" ]; then
  if [ ! -s "$backup_path/schema.sql" ] || [ ! -s "$backup_path/data.sql" ]; then
    echo "Katalog backupu musi zawierać niepuste schema.sql i data.sql." >&2
    exit 1
  fi
  docker cp "$backup_path/schema.sql" "$container:$container_backup/schema.sql"
  docker cp "$backup_path/data.sql" "$container:$container_backup/data.sql"
  docker exec "$container" psql -U supabase_admin -d "$test_db" -v ON_ERROR_STOP=1 -c \
    'create schema if not exists extensions; create schema if not exists vault; create extension if not exists pg_stat_statements with schema extensions; create extension if not exists pgcrypto with schema extensions; create extension if not exists supabase_vault with schema vault; create extension if not exists "uuid-ossp" with schema extensions; create publication supabase_realtime;'
  docker exec "$container" pg_dump \
    -U supabase_admin \
    -d postgres \
    --schema-only \
    --schema=auth \
    --schema=storage \
    --no-owner \
    --no-privileges \
    --file="$container_backup/platform.sql"
  docker exec "$container" psql -U supabase_admin -d "$test_db" -v ON_ERROR_STOP=1 -f "$container_backup/platform.sql"
  docker exec "$container" psql -U supabase_admin -d "$test_db" -v ON_ERROR_STOP=1 -f "$container_backup/schema.sql"
  docker exec "$container" psql -U supabase_admin -d "$test_db" -v ON_ERROR_STOP=1 -f "$container_backup/data.sql"
elif [ "${backup_path##*.}" = "sql" ]; then
  docker cp "$backup_path" "$container:$container_backup/database.sql"
  docker exec "$container" psql -U supabase_admin -d "$test_db" -v ON_ERROR_STOP=1 -f "$container_backup/database.sql"
else
  docker cp "$backup_path" "$container:$container_backup/database.dump"
  docker exec "$container" pg_restore \
    -U supabase_admin \
    -d "$test_db" \
    --no-owner \
    --no-privileges \
    --exit-on-error \
    "$container_backup/database.dump"
fi

summary="$(docker exec "$container" psql -U supabase_admin -d "$test_db" -Atc \
  "select json_build_object(
    'users', (select count(*) from auth.users),
    'exercises', (select count(*) from public.exercises),
    'sessions', (select count(*) from public.sessions),
    'pods', (select count(*) from public.pods),
    'storage_objects', (select count(*) from storage.objects)
  )")"

echo "✅ Restore zakończony w odizolowanej bazie: $summary"
