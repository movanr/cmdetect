# CMDetect Deployment Quick Start

Schritt-für-Schritt Anleitung für das erste Production Deployment auf einem Hetzner Server.

---

## 📋 Voraussetzungen

- Hetzner Server (Ubuntu 22.04 oder 24.04)
- Domain mit DNS-Einträgen auf Server-IP
- SSH-Zugriff zum Server

---

## 🚀 Deployment Steps

### 1. Server Setup (Einmalig)

Auf dem **Server** als root:

```bash
# Server-Setup-Script ausführen
curl -fsSL https://raw.githubusercontent.com/YOUR-REPO/cmdetect/main/setup-server.sh | bash

# Oder wenn Repository bereits geklont:
cd /opt/cmdetect
sudo ./setup-server.sh
```

**Was das Script macht:**
- Installiert Node.js 22, pnpm, PM2, Caddy, Docker, Hasura CLI
- Konfiguriert UFW Firewall (Ports 22, 80, 443)
- Installiert Fail2ban für SSH-Schutz
- Erstellt `/opt/cmdetect` Verzeichnis
- Erstellt `cmdetect` System-User

---

### 2. Repository klonen

```bash
# Als cmdetect user
sudo su - cmdetect
cd /opt/cmdetect

# Repository klonen (ODER per rsync hochladen)
git clone https://github.com/YOUR-REPO/cmdetect.git .
```

---

### 3. Secrets generieren

```bash
cd /opt/cmdetect

# Secrets generieren und in .env speichern
./scripts/generate-secrets.sh > .env

# .env editieren
nano .env
```

**Wichtig zu ändern:**
- `DOMAIN=staging.cmdetect.de` → Deine Domain eintragen
- `SMTP_*` Variablen (falls Email-Verifikation gewünscht)

**Permissions setzen:**
```bash
chmod 600 .env
```

---

### 4. DNS Records einrichten

Stelle sicher, dass folgende DNS A-Records auf deine Server-IP zeigen:

```
staging.cmdetect.de          → SERVER_IP
app.staging.cmdetect.de      → SERVER_IP
patient.staging.cmdetect.de  → SERVER_IP
auth.staging.cmdetect.de     → SERVER_IP
api.staging.cmdetect.de      → SERVER_IP
```

**Test:**
```bash
dig +short staging.cmdetect.de
# Sollte deine Server-IP zurückgeben
```

---

### 5. Initial Deployment

```bash
cd /opt/cmdetect

# Dependencies installieren
pnpm install --frozen-lockfile

# Shared packages bauen
pnpm --filter @cmdetect/config build

# Frontends bauen
pnpm --filter @cmdetect/frontend build
pnpm --filter @cmdetect/patient-frontend build

# Docker Services starten
docker compose -f docker-compose.prod.yml up -d

# Warten bis Services ready sind
sleep 20

# Hasura Migrations anwenden
cd apps/hasura
hasura migrate apply --endpoint http://localhost:8080 --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET
hasura metadata apply --endpoint http://localhost:8080 --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET
cd ../..
```

---

### 6. Caddy konfigurieren

```bash
# Caddyfile kopieren
sudo cp Caddyfile /etc/caddy/Caddyfile

# Validieren
sudo caddy validate --config /etc/caddy/Caddyfile

# Caddy neu starten (holt automatisch SSL-Zertifikate)
sudo systemctl restart caddy

# Status checken
sudo systemctl status caddy
```

**Caddy wird automatisch Let's Encrypt SSL-Zertifikate holen!**

---

### 7. Systemd Service einrichten (Optional)

Für automatischen Start nach Reboot:

```bash
# Service-File kopieren
sudo cp scripts/cmdetect.service /etc/systemd/system/

# Service aktivieren
sudo systemctl daemon-reload
sudo systemctl enable cmdetect
sudo systemctl start cmdetect

# Status checken
sudo systemctl status cmdetect
```

---

### 8. Backup einrichten

```bash
# Backup-Script testen
./scripts/backup.sh

# Automatische tägliche Backups (3 Uhr morgens)
sudo crontab -e
# Füge hinzu:
0 3 * * * /opt/cmdetect/scripts/backup.sh >> /opt/cmdetect/logs/backup.log 2>&1
```

---

## ✅ Deployment verifizieren

### Services checken

```bash
# Docker Services
docker compose -f docker-compose.prod.yml ps

# Logs ansehen
docker compose -f docker-compose.prod.yml logs -f

# Caddy Status
sudo systemctl status caddy
```

### URLs testen

Öffne im Browser:

- **Marketing**: https://staging.cmdetect.de
- **Practitioner**: https://app.staging.cmdetect.de (Username: `dev`, Passwort: siehe Basic Auth Hash)
- **Patient**: https://patient.staging.cmdetect.de
- **API Health**: https://api.staging.cmdetect.de/healthz
- **Auth Health**: https://auth.staging.cmdetect.de/api/auth/health

**Basic Auth Credentials:**
- Username: `dev`
- Passwort: Das Passwort, das du für den Caddy Hash verwendet hast

---

## 🔄 Updates deployen

Für zukünftige Updates:

```bash
cd /opt/cmdetect
./scripts/deploy.sh
```

**Das Script macht:**
1. Git pull
2. Dependencies installieren
3. Frontends bauen
4. Caddyfile neu laden
5. Docker Services neu starten
6. Hasura Migrations anwenden

**Flags:**
```bash
./scripts/deploy.sh --skip-build       # Überspringt Frontend-Builds
./scripts/deploy.sh --skip-migrations  # Überspringt Hasura-Migrations
```

---

## 🐛 Troubleshooting

### Caddy startet nicht

```bash
# Logs checken
sudo journalctl -u caddy -n 50

# Caddyfile validieren
sudo caddy validate --config /etc/caddy/Caddyfile
```

### Docker Services starten nicht

```bash
# Logs ansehen
docker compose -f docker-compose.prod.yml logs

# Services neu bauen
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Hasura Migrations schlagen fehl

```bash
# Hasura Console öffnen
cd apps/hasura
hasura console --endpoint http://localhost:8080 --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET

# Migrations manuell checken
hasura migrate status
```

### SSL-Zertifikate werden nicht geholt

```bash
# Caddy Logs checken
sudo journalctl -u caddy -f

# DNS Records verifizieren
dig +short app.staging.cmdetect.de

# Sicherstellen dass Ports 80 und 443 offen sind
sudo ufw status
```

---

## 📦 Dateiübersicht

| Datei | Zweck |
|-------|-------|
| `docker-compose.prod.yml` | Production Docker Compose Config |
| `scripts/generate-secrets.sh` | Generiert sichere Secrets |
| `scripts/deploy.sh` | Kompletter Deployment-Workflow |
| `scripts/backup.sh` | Automatische DB-Backups |
| `scripts/cmdetect.service` | Systemd Service File |
| `Caddyfile` | Caddy Webserver Config (Reverse Proxy + SSL) |

---

## 🔒 Sicherheits-Checklist

- [ ] UFW Firewall aktiv (nur Ports 22, 80, 443)
- [ ] Fail2ban aktiv für SSH
- [ ] PostgreSQL nur auf localhost (127.0.0.1)
- [ ] Hasura nur auf localhost (127.0.0.1)
- [ ] Auth-Server nur auf localhost (127.0.0.1)
- [ ] Basic Auth auf allen Frontends
- [ ] SSL-Zertifikate von Let's Encrypt
- [ ] `.env` File Permissions: 600
- [ ] Automatische Backups eingerichtet
- [ ] Admin Secret niemals im Browser verwenden

---

## 📞 Support

Bei Problemen:
1. Logs checken: `docker compose -f docker-compose.prod.yml logs`
2. Services Status: `systemctl status caddy` und `docker compose ps`
3. Firewall: `sudo ufw status verbose`
