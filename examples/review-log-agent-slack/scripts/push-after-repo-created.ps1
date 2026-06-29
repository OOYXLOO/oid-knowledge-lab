param(
  [string]$RemoteUrl = "https://github.com/OOYXLOO/review-log-agent-slack.git"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

Write-Host "Checking local repository..."
git status --short --branch

Write-Host "Running verification..."
npm run check
npm test
npm run build

Write-Host "Checking remote: $RemoteUrl"
$remoteStatus = & curl.exe -L -s -o NUL -w "%{http_code}" ($RemoteUrl -replace "\.git$", "")
if ($remoteStatus -eq "404") {
  throw "GitHub repository is still missing. Create OOYXLOO/review-log-agent-slack first, then rerun this script."
}

$existingRemote = ""
try {
  $existingRemote = git remote get-url origin
} catch {
  $existingRemote = ""
}

if (-not $existingRemote) {
  git remote add origin $RemoteUrl
} elseif ($existingRemote -ne $RemoteUrl) {
  git remote set-url origin $RemoteUrl
}

git push -u origin main

Write-Host "Push complete."
Write-Host "After the first push, enable GitHub Pages from Actions if GitHub asks for confirmation."

