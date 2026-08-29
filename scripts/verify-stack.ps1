<#
════════════════════════════════════════════════════════════════════════════
  Recette du socle Docker local  -  prompt 01 (Windows / PowerShell).

  Exécute les six vérifications exigées :
    1. docker compose config
    2. démarrage des services
    3. healthchecks
    4. connexion PostgreSQL
    5. accès MinIO
    6. réception d'un e-mail de test dans Mailpit

  Usage :
    powershell -ExecutionPolicy Bypass -File scripts\verify-stack.ps1
    powershell -ExecutionPolicy Bypass -File scripts\verify-stack.ps1 -Keep
════════════════════════════════════════════════════════════════════════════
#>
[CmdletBinding()]
param([switch]$Keep)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$script:Pass = 0
$script:Fail = 0
$script:Results = @()

function Ok($m)   { $script:Pass++; $script:Results += "PASS  $m"; Write-Host "  PASS  $m" -ForegroundColor Green }
function Ko($m)   { $script:Fail++; $script:Results += "FAIL  $m"; Write-Host "  FAIL  $m" -ForegroundColor Red }
function Step($m) { Write-Host ""; Write-Host $m -ForegroundColor White -BackgroundColor DarkBlue }

function DC { docker compose --env-file .env.local @args }

function Get-EnvValue($name, $fallback) {
  $line = Select-String -Path .env.local -Pattern "^$name=" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -eq $line) { return $fallback }
  $value = $line.Line.Split('=', 2)[1]
  if ([string]::IsNullOrWhiteSpace($value)) { return $fallback }
  return $value.Trim()
}

# ── Pré-requis ────────────────────────────────────────────────────────────
Step "0. Pre-requis"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "  Docker est introuvable. Installez Docker Desktop puis relancez." -ForegroundColor Yellow
  exit 2
}
Ok "Docker CLI present - $(docker --version)"

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "  Le demon Docker ne repond pas. Demarrez Docker Desktop puis relancez." -ForegroundColor Yellow
  exit 2
}
Ok "Demon Docker joignable"

if (-not (Test-Path .env.local)) {
  Copy-Item .env.example .env.local
  Write-Host "  .env.local cree depuis .env.example." -ForegroundColor Yellow
  Write-Host "  ATTENTION : remplacez les valeurs << change-me >> avant d'aller plus loin." -ForegroundColor Yellow
}
Ok ".env.local present"

if (Select-String -Path .env.local -Pattern 'change-me' -Quiet) {
  Ko ".env.local contient encore des valeurs << change-me >> (a remplacer avant le prompt 03)"
} else {
  Ok ".env.local ne contient plus de valeur d'exemple"
}

# ── 1. Validation du fichier compose ──────────────────────────────────────
Step "1. docker compose config"

DC config --quiet
if ($LASTEXITCODE -eq 0) { Ok "Configuration de developpement valide" } else { Ko "Configuration de developpement invalide" }

DC -f docker-compose.yml -f docker-compose.prod.yml config --quiet
if ($LASTEXITCODE -eq 0) { Ok "Configuration de production valide" } else { Ko "Configuration de production invalide" }

$config = DC config --format json | ConvertFrom-Json
$exposed = @()
foreach ($svc in $config.services.PSObject.Properties) {
  foreach ($p in @($svc.Value.ports)) {
    if ($null -eq $p) { continue }
    $ip = if ($p.host_ip) { $p.host_ip } else { '0.0.0.0' }
    if ($svc.Name -ne 'nginx' -and $ip -notin @('127.0.0.1', '::1')) {
      $exposed += "$($svc.Name):$($p.published)"
    }
  }
}
if ($exposed.Count -eq 0) {
  Ok "Aucun service autre que Nginx n'est expose hors de la boucle locale"
} else {
  Ko "Services exposes publiquement : $($exposed -join ', ')"
}

# ── 2. Démarrage ──────────────────────────────────────────────────────────
Step "2. Demarrage des services"
DC up -d --build
if ($LASTEXITCODE -eq 0) {
  Ok "docker compose up termine"
} else {
  Ko "docker compose up a echoue"
  # `deps` installe les dependances : s'il echoue, web et cms demarrent sans
  # node_modules et se plaignent de << next: not found >>. La cause reelle est
  # toujours dans son log.
  Write-Host ""
  Write-Host "  -- Log du service deps (cause probable) --" -ForegroundColor Yellow
  DC logs --no-color deps 2>&1 | Select-Object -Last 30 | ForEach-Object { Write-Host "    $_" }
}

# ── 3. Healthchecks ───────────────────────────────────────────────────────
Step "3. Healthchecks (jusqu'a 5 minutes - la premiere compilation Next.js est longue)"

function Wait-Healthy($svc) {
  $deadline = (Get-Date).AddMinutes(5)
  while ((Get-Date) -lt $deadline) {
    $id = (DC ps -q $svc) | Select-Object -First 1
    if ($id) {
      $state = docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}nohealth{{end}}' $id 2>$null
      if ($state -eq 'healthy')   { return $true }
      if ($state -eq 'unhealthy') { return $false }
    }
    Start-Sleep -Seconds 5
  }
  return $false
}

foreach ($svc in @('postgres', 'minio', 'mailpit', 'cms', 'web', 'nginx')) {
  if (Wait-Healthy $svc) { Ok "healthcheck $svc" } else { Ko "healthcheck $svc" }
}

# ── 4. PostgreSQL ─────────────────────────────────────────────────────────
Step "4. Connexion PostgreSQL"

DC exec -T postgres sh -lc 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q'
if ($LASTEXITCODE -eq 0) { Ok "pg_isready repond" } else { Ko "pg_isready ne repond pas" }

$version = DC exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select version()"'
if ($version -match 'PostgreSQL') { Ok "Requete SQL executee : $($version -replace ' on .*','')" } else { Ko "Impossible d'executer une requete SQL" }

# ── 5. MinIO ──────────────────────────────────────────────────────────────
Step "5. Acces MinIO"

DC exec -T minio mc ready local
if ($LASTEXITCODE -eq 0) { Ok "MinIO pret" } else { Ko "MinIO non pret" }

$bucket = Get-EnvValue 'MINIO_BUCKET' 'africa-media'
DC exec -T minio mc ls "local/$bucket" *> $null
if ($LASTEXITCODE -eq 0) {
  Ok "Bucket << $bucket >> accessible"
} else {
  Ko "Bucket << $bucket >> introuvable (relancez : docker compose --env-file .env.local up minio-init)"
}

# ── 6. Mailpit ────────────────────────────────────────────────────────────
Step "6. Envoi et reception d'un e-mail de test"

$smtp = DC exec -T cms node scripts/smtp-test.mjs 2>&1 | Out-String
$smtp.Trim().Split("`n") | ForEach-Object { Write-Host "     $_" }
if ($smtp -match '\[smtp-test\] OK') { Ok "Message accepte par le serveur SMTP" } else { Ko "Envoi SMTP en echec" }

$mailpitPort = Get-EnvValue 'MAILPIT_UI_DEV_PORT' '8025'
Start-Sleep -Seconds 2
try {
  $inbox = Invoke-RestMethod -Uri "http://127.0.0.1:$mailpitPort/api/v1/messages?limit=5" -TimeoutSec 10
  if ($inbox.messages_count -gt 0) {
    Ok "Mailpit contient $($inbox.messages_count) message(s) - interface : http://127.0.0.1:$mailpitPort"
  } else {
    Ko "Aucun message visible dans Mailpit"
  }
} catch {
  Ko "Interface Mailpit injoignable sur le port $mailpitPort"
}

# ── 7. Points d'entrée HTTP ───────────────────────────────────────────────
Step "7. Points d'entree HTTP via Nginx"

$httpPort = Get-EnvValue 'NGINX_HTTP_PORT' '8080'

function Probe($label, $path, $hostHeader, $expected) {
  $headers = @{}
  if ($hostHeader) { $headers['Host'] = $hostHeader }
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$httpPort$path" -Headers $headers `
         -MaximumRedirection 0 -SkipHttpErrorCheck -TimeoutSec 20
    $code = $r.StatusCode
  } catch {
    $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
  }
  if ($code -eq $expected) { Ok "$label ($code)" } else { Ko "$label - attendu $expected, obtenu $code" }
}

Probe "Sante Nginx"        "/nginx-health" $null              200
Probe "Site public"        "/"             $null              200
Probe "web /healthz"       "/healthz"      $null              200
Probe "web /readyz"        "/readyz"       $null              200
Probe "Redirection /admin" "/admin"        $null              301
Probe "Dashboard Payload"  "/admin"        "admin.localhost"  200
Probe "cms /api/health"    "/api/health"   "admin.localhost"  200

# ── 8. Arrêt ──────────────────────────────────────────────────────────────
if (-not $Keep) {
  Step "8. Arret des services (les volumes de donnees sont conserves)"
  DC down
  if ($LASTEXITCODE -eq 0) { Ok "docker compose down" } else { Ko "docker compose down" }
} else {
  Step "8. Pile laissee demarree (-Keep)"
}

# ── Bilan ─────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=== Bilan ===" -ForegroundColor White -BackgroundColor DarkBlue
$script:Results | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Reussis : $script:Pass   Echoues : $script:Fail"

if ($script:Fail -gt 0) { exit 1 }
