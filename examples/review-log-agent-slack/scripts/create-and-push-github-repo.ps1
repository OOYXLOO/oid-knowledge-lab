param(
  [string]$Owner = "OOYXLOO",
  [string]$Repo = "review-log-agent-slack",
  [switch]$Private
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$visibility = if ($Private) { "--private" } else { "--public" }
$remoteUrl = "https://github.com/$Owner/$Repo.git"
$repoName = "$Owner/$Repo"

Write-Host "Review Log Agent GitHub publisher"
Write-Host "Repository: $repoName"
Write-Host "Remote:     $remoteUrl"
Write-Host ""

Write-Host "Checking GitHub CLI authentication..."
gh auth status

Write-Host "Running local verification..."
npm run check
npm test
npm run build
npm run guard:publishable

$repoExists = $false
try {
  gh repo view $repoName --json nameWithOwner | Out-Null
  $repoExists = $true
} catch {
  $repoExists = $false
}

if (-not $repoExists) {
  Write-Host "Creating GitHub repository..."
  gh repo create $repoName $visibility --source "." --remote origin --description "Slack-style review threads to source-aware evidence logs" --push
} else {
  Write-Host "Repository already exists. Ensuring remote and pushing..."
  $existingRemote = ""
  try {
    $existingRemote = git remote get-url origin
  } catch {
    $existingRemote = ""
  }

  if (-not $existingRemote) {
    git remote add origin $remoteUrl
  } elseif ($existingRemote -ne $remoteUrl) {
    git remote set-url origin $remoteUrl
  }

  git push -u origin main
}

Write-Host "Done."
Write-Host "Public repository: https://github.com/$repoName"
