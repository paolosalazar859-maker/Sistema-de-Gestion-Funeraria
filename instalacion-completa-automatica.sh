#!/bin/bash

# 🚀 Script de instalación completa de AURA
# Ejecuta este script después de descargar el proyecto de Figma Make

set -e

clear
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║        🏛️  AURA - INSTALACIÓN COMPLETA AUTOMATIZADA         ║"
echo "║                                                               ║"
echo "║  Este script instalará dependencias, creará instaladores     ║"
echo "║  y te dará la opción de instalar AURA en tu Mac             ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "⏱️  Tiempo estimado: 15-20 minutos"
echo ""
read -p "Presiona ENTER para comenzar..."
echo ""

# Verificar que estamos en la carpeta correcta
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verificando carpeta del proyecto..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json"
    echo "   Asegúrate de estar en la carpeta del proyecto AURA"
    echo ""
    echo "   Comandos para navegar:"
    echo "   cd ~/Desktop/AURA"
    echo ""
    exit 1
fi

echo "✅ Carpeta correcta detectada"
echo "   📁 Ubicación: $(pwd)"
echo ""

# Verificar Node.js
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verificando Node.js..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo ""
    echo "   Por favor, instala Node.js:"
    echo "   1. Ve a https://nodejs.org"
    echo "   2. Descarga la versión LTS"
    echo "   3. Instala"
    echo "   4. Reinicia Terminal"
    echo "   5. Ejecuta este script de nuevo"
    echo ""
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js instalado: $NODE_VERSION"
echo ""

# Instalar dependencias
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Instalando dependencias..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏱️  Esto puede tardar 3-5 minutos..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Hubo un error. Intentando con --legacy-peer-deps..."
    npm install --legacy-peer-deps
fi

echo ""
echo "✅ Dependencias instaladas correctamente"
echo ""

# Dar permisos al script de distribución
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔓 Configurando permisos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "preparar-distribucion-completa.sh" ]; then
    chmod +x preparar-distribucion-completa.sh
    echo "✅ Permisos configurados"
else
    echo "⚠️  No se encuentra preparar-distribucion-completa.sh"
    echo "   Pero podemos continuar con comandos npm"
fi

echo ""

# Preguntar si quiere crear instaladores
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 ¿Crear instaladores ahora?"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Esto creará:"
echo "  • Instalador Mac (DMG)"
echo "  • Instalador Windows (EXE)"
echo "  • Paquetes ZIP listos para distribuir"
echo ""
echo "⏱️  Tiempo: 10-15 minutos"
echo ""
read -p "¿Continuar? (s/n): " crear_instaladores

if [[ $crear_instaladores =~ ^[Ss]$ ]]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔨 Creando instaladores..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if [ -f "preparar-distribucion-completa.sh" ]; then
        ./preparar-distribucion-completa.sh
    else
        echo "Usando comandos npm..."
        echo ""
        
        echo "📦 Paso 1/3: Compilando aplicación..."
        npm run build
        
        echo ""
        echo "🍎 Paso 2/3: Creando instalador Mac..."
        npm run build:mac
        
        echo ""
        echo "🪟 Paso 3/3: Creando instalador Windows..."
        npm run build:win
        
        echo ""
        echo "✅ Instaladores creados en: ./release/"
    fi
    
    echo ""
    echo "✅ ¡Instaladores listos!"
    echo ""
    
    # Preguntar si quiere instalar en Mac
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 ¿Instalar AURA en tu Mac ahora?"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "¿Continuar? (s/n): " instalar_mac
    
    if [[ $instalar_mac =~ ^[Ss]$ ]]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🚀 Instalando AURA en tu Mac..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        if [ -d "dist-cliente/AURA-Instalador-Mac" ]; then
            cd dist-cliente/AURA-Instalador-Mac
            
            if [ -f "instalar-para-cliente.sh" ]; then
                chmod +x instalar-para-cliente.sh
                ./instalar-para-cliente.sh
            else
                echo "Instalando manualmente..."
                if [ -f "AURA-1.0.0-mac.dmg" ]; then
                    echo "📦 Abriendo instalador DMG..."
                    hdiutil attach AURA-1.0.0-mac.dmg -nobrowse -quiet
                    sleep 2
                    
                    echo "📁 Instalando AURA..."
                    cp -r "/Volumes/AURA 1.0.0/AURA.app" /Applications/
                    
                    echo "🧹 Limpiando..."
                    hdiutil detach "/Volumes/AURA 1.0.0" -quiet
                    
                    echo "🔓 Configurando permisos..."
                    xattr -cr /Applications/AURA.app 2>/dev/null || true
                    
                    echo ""
                    echo "✅ AURA instalado en /Applications/"
                    echo ""
                    echo "🚀 Abriendo AURA..."
                    sleep 1
                    open /Applications/AURA.app
                fi
            fi
        else
            echo "⚠️  No se encuentra la carpeta de instaladores"
            echo "   Busca manualmente: dist-cliente/AURA-Instalador-Mac/"
        fi
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡PROCESO COMPLETADO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Instaladores creados en:"
echo "   dist-cliente/"
echo ""
echo "🔐 Credenciales de acceso:"
echo "   Usuario:    admin"
echo "   Contraseña: admin123"
echo ""
echo "⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio"
echo ""
echo "📚 Documentación disponible:"
echo "   • GUIA-PASO-A-PASO-COMPLETA.txt"
echo "   • COMANDOS-RAPIDOS.txt"
echo "   • GUIA-DISTRIBUCION-MAC-WINDOWS.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
