#!/bin/sh
set -eu

dump_path="${1:-}"
container="${LOCAL_DB_CONTAINER:-supabase_db_arco}"

if [ -z "$dump_path" ] || [ ! -f "$dump_path" ]; then
  echo "Użycie: npm run test:restore -- /pełna/ścieżka/database.dump" >&2
  exit 1
fi

stamp="$(date -u +%Y%m%d%H%M%S)"
test_db="arco_restore_${stamp}_$$"
container_dump="/tmp/${test_db}.dump"

cleanup() {
  docker exec "$container" dropdb -U supabase_admin --if-exists "$test_db" >/dev/null 2>&1 || true
  docker exec "$container" rm -f "$container_dump" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker cp "$dump_path" "$container:$container_dump"
docker exec "$container" createdb -U supabase_admin "$test_db"
docker exec "$container" pg_restore \
  -U supabase_admin \
  -d "$test_db" \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  "$container_dump"

summary="$(docker exec "$container" psql -U supabase_admin -d "$test_db" -Atc \
  "select json_build_object(
    'users', (select count(*) from auth.users),
    'exercises', (select count(*) from public.exercises),
    'sessions', (select count(*) from public.sessions),
    'pods', (select count(*) from public.pods),
    'storage_objects', (select count(*) from storage.objects)
  )")"

echo "✅ Restore zakończony w odizolowanej bazie: $summary"
