@echo off
setlocal

:: ===== CONFIGURATION =====
set ZIP_NAME=domain-viewer-extension
set VERSION=1.0.0
set OUTPUT=%ZIP_NAME%_v%VERSION%.zip

:: ===== REMOVE OLD ZIP IF EXISTS =====
if exist %OUTPUT% (
    del %OUTPUT%
)

:: ===== CREATE ZIP =====
powershell -Command ^
  "Compress-Archive -Path @('manifest.json','background.js','popup.html','popup.js') -DestinationPath '%OUTPUT%'"

if exist %OUTPUT% (
    echo Created %OUTPUT% successfully.
) else (
    echo Failed to create zip file.
)

endlocal
pause
