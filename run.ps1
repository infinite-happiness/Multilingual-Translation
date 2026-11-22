# run.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "              Infinite Happiness Deployment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 0. Choose what to run: only the dev server, or the full deploy.

# Shows a menu that is navigated with the up/down arrow keys and confirmed with Enter.
# Returns the index of the chosen option, or -1 when Escape is pressed.
function Select-Option {
    param([string[]]$Options)

    $selected = 0
    $width = [Console]::WindowWidth - 1
    [Console]::CursorVisible = $false
    try {
        while ($true) {
            for ($i = 0; $i -lt $Options.Count; $i++) {
                if ($i -eq $selected) {
                    Write-Host ("  > " + $Options[$i]).PadRight($width) -ForegroundColor Black -BackgroundColor Cyan
                } else {
                    Write-Host ("    " + $Options[$i]).PadRight($width)
                }
            }
            # Measured after drawing, so it stays correct when drawing made the window scroll.
            $top = [Console]::CursorTop - $Options.Count

            $key = [Console]::ReadKey($true)
            if ($key.Key -eq "UpArrow") {
                $selected = ($selected - 1 + $Options.Count) % $Options.Count
            } elseif ($key.Key -eq "DownArrow") {
                $selected = ($selected + 1) % $Options.Count
            } elseif ($key.Key -eq "Enter") {
                return $selected
            } elseif ($key.Key -eq "Escape") {
                return -1
            }
            [Console]::SetCursorPosition(0, $top)
        }
    } finally {
        [Console]::CursorVisible = $true
    }
}

Write-Host "What do you want to do? (up/down arrows to choose, Enter to confirm, Esc to cancel)"
$mode = Select-Option @("Run the dev server (http://localhost:3000)", "Deploy to GitHub Pages", "Cancel")
Write-Host ""

if ($mode -eq 0) {
    Write-Host "Starting the dev server at http://localhost:3000 (Ctrl+C to stop)..." -ForegroundColor Cyan
    pnpm dev
    exit $LASTEXITCODE
} elseif ($mode -ne 1) {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

# 1. Use today's date (local time) as the release label, matching the build date shown in the app.
$releaseDate = Get-Date -Format "yyyy-MM-dd"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Building release $releaseDate..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 2. Build the project
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Build failed with exit code $LASTEXITCODE. Aborting deploy." -ForegroundColor Red
    exit $LASTEXITCODE
}

if (!(Test-Path "dist")) {
    Write-Host "[ERROR] 'dist' directory not found! Aborting deploy." -ForegroundColor Red
    exit 1
}

# 3. Serve the preview before committing
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Serving preview at http://localhost:3000..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Start vite through node directly (not pnpm), so stopping this process also stops the server.
$previewProc = Start-Process node -ArgumentList "node_modules/vite/bin/vite.js", "preview" -WorkingDirectory $PSScriptRoot -PassThru
Start-Sleep -Milliseconds 1500

if ($previewProc.HasExited) {
    Write-Host "[WARNING] Preview server exited (port 3000 may already be in use)." -ForegroundColor Yellow
} else {
    Write-Host "Preview server running at http://localhost:3000 (PID: $($previewProc.Id))" -ForegroundColor Green
}

try {
    Write-Host ""
    $ready = Read-Host "Does the build look good? Proceed to deploy? [Y/n] (or 0 to cancel)"
    if ($ready -eq "n" -or $ready -eq "N" -or $ready -eq "0" -or $ready -eq "q") {
        Write-Host "Deployment aborted." -ForegroundColor Yellow
        exit 0
    }
} finally {
    if ($previewProc -and !$previewProc.HasExited) {
        Write-Host "Stopping preview server..." -ForegroundColor DarkGray
        Stop-Process -Id $previewProc.Id -Force -ErrorAction SilentlyContinue
    }
}

if (!(Test-Path "deploy")) {
    Write-Host "[ERROR] 'deploy' directory not found! Aborting deploy." -ForegroundColor Red
    exit 1
}

# 4. Mirror build to deploy using robocopy
Write-Host ""
Write-Host "Mirroring build to deploy repository..." -ForegroundColor Cyan
& robocopy dist deploy /MIR /XD .git /XF .gitignore README.md | Out-Null
# Robocopy exit code >= 8 indicates error
if ($LASTEXITCODE -ge 8) {
    Write-Host "[ERROR] Robocopy failed with exit code $LASTEXITCODE. Aborting deploy." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 5. Commit and push in deploy
Write-Host ""
# Default message: the release date plus the time, so several deploys on one day can be told apart.
$defaultMsg = "Deploy $releaseDate " + (Get-Date -Format "HH:mm")
$commitMsg = Read-Host "Enter deploy commit message (default: $defaultMsg)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = $defaultMsg
}

Write-Host ""
Write-Host "Committing and pushing to GitHub Pages..." -ForegroundColor Cyan
Push-Location deploy
try {
    git add -A
    git commit -m $commitMsg
    git push origin deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================================" -ForegroundColor Green
        Write-Host " Successfully deployed $releaseDate!" -ForegroundColor Green
        Write-Host " Live URL: https://infinite-happiness.github.io/Multilingual-Translation" -ForegroundColor Green
        Write-Host "========================================================" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Git push in deploy returned exit code $LASTEXITCODE" -ForegroundColor Yellow
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
