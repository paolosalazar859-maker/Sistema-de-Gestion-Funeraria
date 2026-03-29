@echo off
echo 🚀 PREPARANDO INSTALADOR DE WINDOWS (NO PORTABLE)...

:: 1. Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js no esta instalado. Por favor instalalo desde https://nodejs.org/
    pause
    exit /b
)

:: 2. Instalar dependencias si es necesario
if not exist node_modules (
    echo 📦 Instalando dependencias (esto puede tardar)...
    call npm install
)

:: 3. Compilar Frontend y Generar Instalador Windows
echo 🔨 Compilando y empaquetando...
call npm run build:win

echo ✅ ¡INSTALADOR DE WINDOWS LISTO!
echo 📁 Busca el archivo 'AURA-Setup-1.0.0.exe' en la carpeta 'release\'
pause
