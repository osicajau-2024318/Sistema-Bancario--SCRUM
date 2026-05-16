# Build script for AuthServiceBanco solution
# This script uses limited parallelism to prevent out-of-memory errors

param(
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Debug',
    
    [switch]$Clean
)

$ErrorActionPreference = 'Stop'

Write-Host "Building AuthServiceBanco solution..." -ForegroundColor Cyan
Write-Host "Configuration: $Configuration" -ForegroundColor Gray

if ($Clean) {
    Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow
    dotnet clean -c $Configuration -v:minimal
    Remove-Item -Path "src\*/bin", "src\*/obj" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Building with limited parallelism (-m:1)..." -ForegroundColor Yellow
dotnet build -c $Configuration -m:1 --nologo

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    exit 1
}
