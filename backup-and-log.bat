@echo off
setlocal enabledelayedexpansion

set "SITE_DIR=%~dp0"
set "BACKUP_DIR=%SITE_DIR%backups"
set "LOG_FILE=%SITE_DIR%CHANGELOG.md"
set "TIMESTAMP=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"

echo ============================================
echo  LayerZeppelin.pt - Backup and Log
echo  Timestamp: %TIMESTAMP%
echo ============================================
echo.

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Create backup ZIP
set "BACKUP_FILE=%BACKUP_DIR%\backup-%TIMESTAMP%.zip"
echo [1/4] Creating backup: %BACKUP_FILE%
powershell -Command "Compress-Archive -Path '%SITE_DIR%index.html','%SITE_DIR%script.js','%SITE_DIR%style.css','%SITE_DIR%_headers','%SITE_DIR%manifest.json','%SITE_DIR%cookies.html','%SITE_DIR%privacy.html','%SITE_DIR%terms.html','%SITE_DIR%CNAME','%SITE_DIR%robots.txt','%SITE_DIR%sitemap.xml','%SITE_DIR%.gitignore' -DestinationPath '%BACKUP_FILE%' -Force"
echo       Backup created successfully.
echo.

REM Get git info
echo [2/4] Git status:
cd /d "%SITE_DIR%"
git status --short
echo.

REM Count changes
set "CHANGES=0"
for /f %%a in ('git status --short ^| find /c /v ""') do set "CHANGES=%%a"
echo       %CHANGES% files changed.
echo.

REM Append to log
echo [3/4] Appending to changelog...
echo.>> "%LOG_FILE%"
echo --->> "%LOG_FILE%"
echo.>> "%LOG_FILE%"
echo **Backup: %TIMESTAMP%**>> "%LOG_FILE%"
echo **Files changed: %CHANGES%**>> "%LOG_FILE%"
echo.>> "%LOG_FILE%"

echo       Log updated.
echo.

REM Show git log
echo [4/4] Recent commits:
git log --oneline -5
echo.

echo ============================================
echo  Backup complete!
echo  Backup: %BACKUP_FILE%
echo  Log: %LOG_FILE%
echo ============================================
pause