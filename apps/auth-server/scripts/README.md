# Auth-server scripts

## `provision-practice.ts` — creating a practice on the dev server

The provisioning script connects directly to Postgres to create an organization, seed users, and trigger demo case seeding. It must reach Postgres over TCP.

### The catch

`docker-compose.prod.yml` keeps Postgres on an internal Docker network only — port 5432 is **not** published to the host. Running `tsx scripts/provision-practice.ts` from the host fails with `ECONNREFUSED 127.0.0.1:5432`.

`docker-compose.bootstrap.yml` **does** publish 5432 on the host, and both compose files share the same volume (`cmdetect_postgres_data`) and container name — so you can swap Postgres from prod mode to bootstrap mode without losing data.

### Runbook

Brief prod downtime (~1 minute). Run from `/opt/cmdetect` as the `cmdetect` user, with `/var/www/cmdetect/{server,secrets}.env` already sourced into the shell.

```bash
# 1. Stop prod stack
docker compose -f docker-compose.prod.yml down

# 2. Start Postgres in bootstrap mode (port 5432 exposed on localhost)
docker compose -f docker-compose.bootstrap.yml up -d postgres

# 3. Run the provisioning script
cd /opt/cmdetect/apps/auth-server && npx tsx scripts/provision-practice.ts \
  "Dev Praxis" \
  --admin        admin@test.com      "Hans Dieter" \
  --physician    physician@test.com  "Dr. Peter Müller" \
  --assistant    mfa@test.com        "Anna Schmidt" \
  --receptionist reception@test.com  "Sabine Meier"

# 4. Restore prod
docker compose -f docker-compose.bootstrap.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Zero-downtime alternative

Resolve the Postgres container's IP and point the script at it — no stack restart required:

```bash
cd /opt/cmdetect/apps/auth-server && \
  POSTGRES_HOST=$(docker inspect cmdetect_postgres \
    --format '{{(index .NetworkSettings.Networks "cmdetect_internal").IPAddress}}') \
  npx tsx scripts/provision-practice.ts "Dev Praxis" --admin ... --physician ...
```

`dotenv` in the script does not overwrite already-exported env vars, so the exported `POSTGRES_HOST` wins over whatever is in `/opt/cmdetect/.env`.

### Flags

- `--admin`        → `org_admin` + `physician`
- `--physician`    → `physician`
- `--assistant`    → `assistant`
- `--receptionist` → `receptionist`

Each flag takes `<email> <full name>`. All users are created with password `Passwort123!` — change after first login. The admin needs to set up the encryption key on first login.
