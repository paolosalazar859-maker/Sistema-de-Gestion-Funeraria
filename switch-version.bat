@echo off
REM Script para cambiar entre versión Web y Electron (Windows)

echo.
echo 🎯 AURA - Selector de Versión
echo ==============================
echo.
echo Selecciona la versión a usar:
echo 1) Web (PWA) - Para desarrollo web y deploy en Vercel
echo 2) Electron - Para desarrollo de app de escritorio
echo.
set /p option="Opción (1 o 2): "

if "%option%"=="1" goto web
if "%option%"=="2" goto electron
goto invalid

:web
echo.
echo 📱 Cambiando a versión WEB...
if exist package.json (
    move /Y package.json package-electron.json >nul
)
if exist package-web.json (
    move /Y package-web.json package.json >nul
)
echo ✅ Configurado para versión WEB
echo.
echo Próximos pasos:
echo   1. npm install
echo   2. npm run dev (desarrollo)
echo   3. npm run build (producción)
echo   4. git push (deploy automático en Vercel)
goto end

:electron
echo.
echo 💻 Cambiando a versión ELECTRON...
if exist package.json (
    move /Y package.json package-web.json >nul
)
if exist package-electron.json (
    move /Y package-electron.json package.json >nul
)
echo ✅ Configurado para versión ELECTRON
echo.
echo Próximos pasos:
echo   1. npm install
echo   2. npm run dev (desarrollo)
echo   3. npm run build:win (build Windows)
echo   4. npm run build:mac (build macOS)
echo   5. npm run build:linux (build Linux)
goto end

:invalid
echo.
echo ❌ Opción inválida. Usa 1 o 2.
exit /b 1

:end
echo.
pause
