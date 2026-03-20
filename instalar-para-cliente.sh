#!/bin/bash

# 🎯 Instalador ultra-simple para el cliente
# Este script permite al cliente instalar AURA con un solo comando

set -e

clear
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║           🏛️  AURA - Sistema de Gestión Funeraria           ║"
echo "║                   INSTALADOR AUTOMÁTICO                       ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Este instalador configurará AURA en tu Mac automáticamente."
echo ""
read -p "Presiona ENTER para continuar..."
echo ""

# 1. Verificar que existe el DMG
if [ ! -f "AURA-1.0.0-mac.dmg" ]; then
    echo "❌ Error: No se encuentra AURA-1.0.0-mac.dmg"
    echo "   Asegúrate de estar en la carpeta correcta."
    exit 1
fi

# 2. Abrir el DMG
echo "📦 Abriendo instalador..."
hdiutil attach AURA-1.0.0-mac.dmg -nobrowse -quiet
sleep 2

# 3. Copiar a Aplicaciones
echo "📁 Instalando AURA en Aplicaciones..."
if [ -d "/Applications/AURA.app" ]; then
    echo "⚠️  Desinstalando versión anterior..."
    rm -rf /Applications/AURA.app
fi
cp -r "/Volumes/AURA 1.0.0/AURA.app" /Applications/
echo "✅ AURA instalado"
sleep 1

# 4. Desmontar el DMG
echo "🧹 Limpiando..."
hdiutil detach "/Volumes/AURA 1.0.0" -quiet
sleep 1

# 5. Remover cuarentena
echo "🔓 Configurando permisos..."
xattr -cr /Applications/AURA.app 2>/dev/null || true
echo "✅ Permisos configurados"
sleep 1

# 6. Abrir AURA
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡INSTALACIÓN COMPLETADA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 Credenciales de acceso:"
echo "   Usuario:    admin"
echo "   Contraseña: admin123"
echo ""
echo "⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio"
echo ""
echo "🚀 Abriendo AURA..."
sleep 2

open /Applications/AURA.app

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ ¡Disfruta de AURA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
