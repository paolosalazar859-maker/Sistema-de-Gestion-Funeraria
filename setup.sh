#!/bin/bash

# Script de verificación e instalación de AURA
# Este script verifica todas las dependencias y prepara la aplicación

echo "🔍 ════════════════════════════════════════════════════════════════"
echo "   VERIFICACIÓN E INSTALACIÓN - SISTEMA AURA"
echo "════════════════════════════════════════════════════════════════"
echo ""

# 1. Verificar Node.js
echo "1️⃣  Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "   ❌ Node.js no está instalado"
    echo "   Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "   ✅ Node.js: $NODE_VERSION"
echo ""

# 2. Verificar npm
echo "2️⃣  Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "   ❌ npm no está instalado"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "   ✅ npm: $NPM_VERSION"
echo ""

# 3. Verificar package.json
echo "3️⃣  Verificando package.json..."
if [ ! -f "package.json" ]; then
    echo "   ❌ package.json no encontrado"
    exit 1
fi
echo "   ✅ package.json encontrado"
echo ""

# 4. Instalar dependencias
echo "4️⃣  Instalando dependencias..."
echo "   Esto puede tomar unos minutos..."
echo ""
npm install
if [ $? -ne 0 ]; then
    echo "   ❌ Error instalando dependencias"
    exit 1
fi
echo ""
echo "   ✅ Dependencias instaladas"
echo ""

# 5. Verificar electron-updater
echo "5️⃣  Verificando electron-updater..."
if grep -q '"electron-updater"' package.json; then
    echo "   ✅ electron-updater está en package.json"
else
    echo "   ⚠️  electron-updater no encontrado, instalando..."
    npm install electron-updater
fi
echo ""

# 6. Recompilar better-sqlite3
echo "6️⃣  Recompilando better-sqlite3 para Electron..."
echo "   Esto puede tomar unos minutos..."
echo ""
npx electron-rebuild -f -w better-sqlite3
if [ $? -ne 0 ]; then
    echo "   ⚠️  Advertencia: Error al recompilar better-sqlite3"
    echo "   Si tienes problemas, ejecuta manualmente:"
    echo "   npm install --save-dev electron-rebuild"
    echo "   npx electron-rebuild -f -w better-sqlite3"
    echo ""
else
    echo "   ✅ better-sqlite3 recompilado correctamente"
    echo ""
fi

# 7. Verificar archivos clave
echo "7️⃣  Verificando archivos del sistema..."
FILES=(
    "electron.js"
    "database.js"
    "backup-manager.js"
    "update-manager.js"
    "preload.js"
    "src/app/components/UpdateManager.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file NO ENCONTRADO"
    fi
done
echo ""

# 8. Resumen
echo "════════════════════════════════════════════════════════════════"
echo "   ✅ VERIFICACIÓN COMPLETADA"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 PASOS SIGUIENTES:"
echo ""
echo "   Para ejecutar en modo desarrollo:"
echo "   1. Terminal 1: npm run vite"
echo "   2. Terminal 2: npm run electron"
echo ""
echo "   O en una sola terminal:"
echo "   npm run dev"
echo ""
echo "📚 DOCUMENTACIÓN DISPONIBLE:"
echo "   • GUIA-ACTUALIZACIONES.md  - Sistema de actualizaciones"
echo "   • GUIA-SQLITE.md           - Base de datos SQLite"
echo "   • GUIA-ELECTRON.md         - Aplicación de escritorio"
echo ""
echo "════════════════════════════════════════════════════════════════"
