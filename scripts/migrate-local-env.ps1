[CmdletBinding(SupportsShouldProcess)]
param(
  [string]$Path = '.env.local'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $Path)) {
  throw "Fichier introuvable : $Path"
}

$lines = Get-Content -LiteralPath $Path
$values = @{}
foreach ($line in $lines) {
  if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
    $values[$matches[1]] = $matches[2]
  }
}

function New-HexSecret([int]$Bytes = 48) {
  $buffer = New-Object byte[] $Bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buffer)
  return ([BitConverter]::ToString($buffer)).Replace('-', '').ToLowerInvariant()
}

function Has-Value([string]$Name) {
  return $values.ContainsKey($Name) -and -not [string]::IsNullOrWhiteSpace($values[$Name])
}

$legacyKeys = @('MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY', 'MINIO_BUCKET')
$s3Keys = @('S3_ENDPOINT', 'S3_PORT', 'S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY')
$missingS3 = @($s3Keys | Where-Object { -not (Has-Value $_) })
$hasS3 = $missingS3.Count -eq 0
$hasLegacy = @($legacyKeys | Where-Object { -not (Has-Value $_) }).Count -eq 0

if ($hasS3) {
  # Le fichier a déjà été migré : conserver les valeurs S3 existantes et
  # rendre le script réexécutable sans exiger les anciennes variables MINIO_*.
  $replacement = [ordered]@{
    S3_ENDPOINT = $values['S3_ENDPOINT']
    S3_PORT = $values['S3_PORT']
    S3_USE_SSL = $(if (Has-Value 'S3_USE_SSL') { $values['S3_USE_SSL'] } else { 'false' })
    S3_REGION = $(if (Has-Value 'S3_REGION') { $values['S3_REGION'] } else { 'us-east-1' })
    S3_BUCKET = $values['S3_BUCKET']
    S3_ACCESS_KEY = $values['S3_ACCESS_KEY']
    S3_SECRET_KEY = $values['S3_SECRET_KEY']
    S3_BACKUP_ACCESS_KEY = $(if (Has-Value 'S3_BACKUP_ACCESS_KEY') { $values['S3_BACKUP_ACCESS_KEY'] } else { 'local-backup-read' })
    S3_BACKUP_SECRET_KEY = $(if (Has-Value 'S3_BACKUP_SECRET_KEY') { $values['S3_BACKUP_SECRET_KEY'] } else { New-HexSecret })
    SEAWEEDFS_DEV_PORT = $(if (Has-Value 'SEAWEEDFS_DEV_PORT') { $values['SEAWEEDFS_DEV_PORT'] } else { '8333' })
  }
} elseif ($hasLegacy) {
  # Première migration d'un ancien fichier contenant encore MINIO_*.
  $replacement = [ordered]@{
    S3_ENDPOINT = 'seaweedfs'
    S3_PORT = '8333'
    S3_USE_SSL = 'false'
    S3_REGION = $(if (Has-Value 'MINIO_REGION') { $values['MINIO_REGION'] } else { 'us-east-1' })
    S3_BUCKET = $values['MINIO_BUCKET']
    S3_ACCESS_KEY = $values['MINIO_ACCESS_KEY']
    S3_SECRET_KEY = $values['MINIO_SECRET_KEY']
    S3_BACKUP_ACCESS_KEY = $(if (Has-Value 'S3_BACKUP_ACCESS_KEY') { $values['S3_BACKUP_ACCESS_KEY'] } else { 'local-backup-read' })
    S3_BACKUP_SECRET_KEY = $(if (Has-Value 'S3_BACKUP_SECRET_KEY') { $values['S3_BACKUP_SECRET_KEY'] } else { New-HexSecret })
    SEAWEEDFS_DEV_PORT = '8333'
  }
} else {
  $missing = if ($missingS3.Count -gt 0) { $missingS3 -join ', ' } else { $legacyKeys -join ', ' }
  throw "Configuration de stockage incomplete dans $Path. Variables manquantes : $missing. Utilisez un fichier MINIO_* ancien complet ou renseignez les variables S3_* de SeaweedFS."
}

$output = [System.Collections.Generic.List[string]]::new()
$emitted = @{}
$obsolete = @(
  'MINIO_ROOT_USER', 'MINIO_ROOT_PASSWORD', 'MINIO_ENDPOINT', 'MINIO_PORT',
  'MINIO_USE_SSL', 'MINIO_REGION', 'MINIO_BUCKET', 'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY', 'MINIO_DEV_PORT', 'MINIO_CONSOLE_DEV_PORT',
  'LIMIT_MINIO_CPUS', 'LIMIT_MINIO_MEMORY'
)

foreach ($line in $lines) {
  if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
    $name = $matches[1]
    if ($replacement.Contains($name)) {
      if (-not $emitted.ContainsKey($name)) {
        [void]$output.Add("$name=$($replacement[$name])")
        $emitted[$name] = $true
      }
      continue
    }
    if ($obsolete -contains $name) { continue }
  }
  [void]$output.Add($line)
}

foreach ($name in $replacement.Keys) {
  if (-not $emitted.ContainsKey($name)) {
    [void]$output.Add("$name=$($replacement[$name])")
  }
}

$backupPath = "$Path.before-seaweedfs"
$temporaryPath = "$Path.tmp-seaweedfs"
if ($PSCmdlet.ShouldProcess($Path, 'migrer les variables MINIO vers S3/SeaweedFS')) {
  Copy-Item -LiteralPath $Path -Destination $backupPath -Force
  [System.IO.File]::WriteAllLines($temporaryPath, $output, [System.Text.UTF8Encoding]::new($false))
  Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
  Write-Host "Migration terminée : $Path"
  Write-Host "Copie de secours conservée : $backupPath"
  Write-Host "Les valeurs secretes n'ont pas ete affichees."
}
