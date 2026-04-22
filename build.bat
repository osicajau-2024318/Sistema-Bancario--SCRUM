@echo off
REM Build script for AuthServiceBanco solution
REM This script uses limited parallelism to prevent out-of-memory errors

setlocal enabledelayedexpansion

set "CONFIG=Debug"
set "CLEAN=0"

REM Parse arguments
if "%1"=="" goto start_build
if /i "%1"=="--clean" set CLEAN=1
if /i "%1"=="/clean" set CLEAN=1
if /i "%1"=="--release" set CONFIG=Release
if /i "%1"=="/release" set CONFIG=Release

:start_build
echo Building AuthServiceBanco solution...
echo Configuration: %CONFIG%

if %CLEAN%==1 (
    echo Cleaning build artifacts...
    dotnet clean -c %CONFIG% -v:minimal
)

echo Building with limited parallelism (-m:1)...
dotnet build -c %CONFIG% -m:1 --nologo

if errorlevel 1 (
    echo.
    echo Build failed!
    exit /b 1
) else (
    echo.
    echo Build completed successfully!
    exit /b 0
)
