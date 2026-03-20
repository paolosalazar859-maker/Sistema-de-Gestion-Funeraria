#!/bin/bash

# Script para cambiar entre versión Web y Electron

echo "🎯 AURA - Selector de Versión"
echo "=============================="
echo ""
echo "Selecciona la versión a usar:"
echo "1) Web (PWA) - Para desarrollo web y deploy en Vercel"
echo "2) Electron - Para desarrollo de app de escritorio"
echo ""
read -p "Opción (1 o 2): " option

case $option in
  1)
    echo ""
    echo "📱 Cambiando a versión WEB..."
    if [ -f "package.json" ]; then
      mv package.json package-electron.json
    fi
    if [ -f "package-web.json" ]; then
      mv package-web.json package.json
    fi
    echo "✅ Configurado para versión WEB"
    echo ""
    echo "Próximos pasos:"
    echo "  1. npm install"
    echo "  2. npm run dev (desarrollo)"
    echo "  3. npm run build (producción)"
    echo "  4. git push (deploy automático en Vercel)"
    ;;
  2)
    echo ""
    echo "💻 Cambiando a versión ELECTRON..."
    if [ -f "package.json" ]; then
      mv package.json package-web.json
    fi
    if [ -f "package-electron.json" ]; then
      mv package-electron.json package.json
    fi
    echo "✅ Configurado para versión ELECTRON"
    echo ""
    echo "Próximos pasos:"
    echo "  1. npm install"
    echo "  2. npm run dev (desarrollo)"
    echo "  3. npm run build:win (build Windows)"
    echo "  4. npm run build:mac (build macOS)"
    echo "  5. npm run build:linux (build Linux)"
    ;;
  *)
    echo ""
    echo "❌ Opción inválida. Usa 1 o 2."
    exit 1
    ;;
esac

echo ""
