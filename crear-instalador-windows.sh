#!/bin/bash

echo "🚀 PREPARANDO INSTALADOR DE WINDOWS (NO PORTABLE)..."

# 1. Asegurar dependencias
# npm install

# 2. Compilar Frontend y Generar Instalador Windows
npm run build:win

echo "✅ ¡INSTALADOR DE WINDOWS LISTO!"
echo "📁 Busca el archivo 'AURA-Setup-1.0.0.exe' en la carpeta 'release/'"
