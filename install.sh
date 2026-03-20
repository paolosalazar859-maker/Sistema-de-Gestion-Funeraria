#!/bin/bash

# 🚀 Script de Instalación Automática - AURA
# Este script compila, desinstala la versión anterior e instala la nueva versión

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GOLD='\033[0;33m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_header() {
    echo ""
    echo -e "${GOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GOLD}  $1${NC}"
    echo -e "${GOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Error: No se encuentra package.json"
    print_error "Ejecuta este script desde la raíz del proyecto AURA"
    exit 1
fi

print_header "🏗️  COMPILACIÓN E INSTALACIÓN DE AURA"

# Paso 1: Compilar la aplicación
print_step "Compilando aplicación..."
if npm run build:mac; then
    print_success "Compilación exitosa"
else
    print_error "Error en la compilación"
    exit 1
fi

# Verificar que el DMG se creó
if [ ! -f "release/AURA-1.0.0-mac.dmg" ]; then
    print_error "Error: No se encontró el DMG compilado"
    exit 1
fi

print_success "DMG generado: release/AURA-1.0.0-mac.dmg"

# Paso 2: Desinstalar versión anterior
print_header "🗑️  DESINSTALANDO VERSIÓN ANTERIOR"

if [ -d "/Applications/AURA.app" ]; then
    print_step "Eliminando AURA.app de Aplicaciones..."
    rm -rf /Applications/AURA.app
    print_success "Versión anterior eliminada"
else
    print_warning "No se encontró una instalación anterior"
fi

# Preguntar si quiere limpiar los datos
echo ""
read -p "¿Deseas eliminar los datos de la aplicación (base de datos, backups)? (s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_step "Eliminando datos de la aplicación..."
    rm -rf ~/Library/Application\ Support/AURA
    rm -rf ~/Library/Preferences/com.aura.funeraria.plist
    print_success "Datos eliminados"
else
    print_warning "Datos conservados - la app usará los datos existentes"
fi

# Paso 3: Instalar nueva versión
print_header "📦 INSTALANDO NUEVA VERSIÓN"

print_step "Montando el DMG..."
hdiutil attach "release/AURA-1.0.0-mac.dmg" -quiet

sleep 2

print_step "Copiando AURA.app a Aplicaciones..."
cp -R "/Volumes/AURA 1.0.0/AURA.app" /Applications/

print_step "Desmontando el DMG..."
hdiutil detach "/Volumes/AURA 1.0.0" -quiet

print_success "Instalación completada"

# Paso 4: Remover cuarentena de macOS
print_header "🔓 CONFIGURANDO PERMISOS"

print_step "Removiendo cuarentena de macOS..."
xattr -cr /Applications/AURA.app
print_success "Permisos configurados correctamente"

# Paso 5: Éxito
print_header "✅ INSTALACIÓN COMPLETADA"

echo -e "${GREEN}¡AURA ha sido instalado exitosamente!${NC}"
echo ""
echo -e "Ubicación: ${BLUE}/Applications/AURA.app${NC}"
echo ""
echo -e "Credenciales por defecto:"
echo -e "  Usuario:    ${GOLD}admin${NC}"
echo -e "  Contraseña: ${GOLD}admin123${NC}"
echo ""

# Preguntar si quiere abrir la aplicación
read -p "¿Deseas abrir AURA ahora? (S/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    print_step "Abriendo AURA..."
    open /Applications/AURA.app
    print_success "¡Disfruta de AURA!"
else
    echo -e "Puedes abrir AURA desde Launchpad o ejecutando:"
    echo -e "  ${BLUE}open /Applications/AURA.app${NC}"
fi

echo ""
print_header "📚 RECURSOS ÚTILES"
echo "  • Guía de instalación: INSTALACION-RAPIDA.md"
echo "  • Guía de actualizaciones: GUIA-ACTUALIZACIONES.md"
echo "  • Base de datos: ~/Library/Application Support/AURA/"
echo "  • Logs: ~/Library/Logs/AURA/"
echo ""

exit 0
