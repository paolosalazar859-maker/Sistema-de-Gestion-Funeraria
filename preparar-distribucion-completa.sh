#!/bin/bash

# 🎁 Script para preparar AURA para distribución en MAC Y WINDOWS
# Este script crea paquetes listos para enviar a clientes

set -e

clear
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║           🎁 PREPARAR AURA PARA DISTRIBUCIÓN                 ║"
echo "║              Mac (DMG) + Windows (EXE)                        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Este script creará instaladores para Mac y Windows."
echo ""
read -p "Presiona ENTER para continuar..."
echo ""

# 1. Limpiar builds anteriores
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 PASO 1/8: Limpiando builds anteriores..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rm -rf dist release dist-cliente
echo "✅ Limpieza completada"
echo ""

# 2. Compilar la aplicación
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 PASO 2/8: Compilando aplicación con Vite..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build
echo "✅ Compilación completada"
echo ""

# 3. Construir instalador Mac
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍎 PASO 3/8: Construyendo instalador para Mac..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build:mac
echo "✅ Instalador Mac creado"
echo ""

# 4. Construir instalador Windows
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🪟 PASO 4/8: Construyendo instalador para Windows..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build:win
echo "✅ Instalador Windows creado"
echo ""

# 5. Crear carpetas de distribución
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 PASO 5/8: Creando paquetes de distribución..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p dist-cliente/AURA-Instalador-Mac
mkdir -p dist-cliente/AURA-Instalador-Windows
mkdir -p dist-cliente/AURA-Instalador-Completo

echo "✅ Carpetas creadas"
echo ""

# 6. Copiar instaladores
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PASO 6/8: Copiando instaladores..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Mac
cp release/AURA-1.0.0-mac.dmg dist-cliente/AURA-Instalador-Mac/
cp instalar-para-cliente.sh dist-cliente/AURA-Instalador-Mac/
chmod +x dist-cliente/AURA-Instalador-Mac/instalar-para-cliente.sh
echo "✅ Instalador Mac copiado"

# Windows
cp release/AURA-Setup-1.0.0.exe dist-cliente/AURA-Instalador-Windows/
echo "✅ Instalador Windows copiado"

# Completo (ambos)
cp release/AURA-1.0.0-mac.dmg dist-cliente/AURA-Instalador-Completo/
cp release/AURA-Setup-1.0.0.exe dist-cliente/AURA-Instalador-Completo/
cp instalar-para-cliente.sh dist-cliente/AURA-Instalador-Completo/
chmod +x dist-cliente/AURA-Instalador-Completo/instalar-para-cliente.sh
echo "✅ Paquete completo preparado"
echo ""

# 7. Crear instrucciones
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PASO 7/8: Creando instrucciones..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Instrucciones Mac
cp MANUAL-CLIENTE-MAC.txt dist-cliente/AURA-Instalador-Mac/ 2>/dev/null || echo "⚠️  MANUAL-CLIENTE-MAC.txt no encontrado"
cat > dist-cliente/AURA-Instalador-Mac/INSTRUCCIONES-MAC.txt << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🏛️  AURA - Sistema de Gestión Funeraria           ║
║               INSTALACIÓN EN MAC (macOS)                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📦 INSTALACIÓN RÁPIDA (2 minutos):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Doble click en: AURA-1.0.0-mac.dmg

2️⃣  Arrastra el ícono de AURA → carpeta Aplicaciones

3️⃣  Ve a Aplicaciones y busca AURA

4️⃣  Click DERECHO en AURA → "Abrir"
    (¡IMPORTANTE! La primera vez usa click derecho)

5️⃣  Click en "Abrir" en el mensaje de seguridad

6️⃣  Login:
    Usuario: admin
    Contraseña: admin123


✅ ¡Listo! AURA está instalado.

⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio.


🆘 SOLUCIÓN DE PROBLEMAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problema: "No se puede abrir porque es de un desarrollador no identificado"
Solución:
  • Click derecho en AURA → "Abrir"
  • O ve a: Preferencias → Seguridad → "Abrir de todos modos"

Problema: La app no abre
Solución:
  1. Abre Terminal (Aplicaciones → Utilidades → Terminal)
  2. Copia y pega:
     xattr -cr /Applications/AURA.app && open /Applications/AURA.app
  3. Presiona Enter


📞 ¿Necesitas ayuda? Contacta a tu proveedor.

© 2026 AURA
EOF

# Instrucciones Windows
cp MANUAL-CLIENTE-WINDOWS.txt dist-cliente/AURA-Instalador-Windows/ 2>/dev/null || echo "⚠️  MANUAL-CLIENTE-WINDOWS.txt no encontrado"
cat > dist-cliente/AURA-Instalador-Windows/INSTRUCCIONES-WINDOWS.txt << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🏛️  AURA - Sistema de Gestión Funeraria           ║
║              INSTALACIÓN EN WINDOWS (PC)                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📦 INSTALACIÓN RÁPIDA (2 minutos):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Doble click en: AURA-Setup-1.0.0.exe

2️⃣  Si aparece "Windows protegió tu PC":
    • Click en "Más información"
    • Click en "Ejecutar de todas formas"

3️⃣  En el instalador:
    • Elige la carpeta de instalación (o deja la predeterminada)
    • Marca "Crear acceso directo en el escritorio"
    • Click en "Instalar"

4️⃣  Espera a que termine la instalación (~30 segundos)

5️⃣  Click en "Finalizar"

6️⃣  Abre AURA desde el escritorio

7️⃣  Login:
    Usuario: admin
    Contraseña: admin123


✅ ¡Listo! AURA está instalado.

⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio.


🆘 SOLUCIÓN DE PROBLEMAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problema: "Windows protegió tu PC"
Solución:
  1. Click en "Más información"
  2. Click en "Ejecutar de todas formas"

Problema: El antivirus bloquea la instalación
Solución:
  • Desactiva temporalmente el antivirus
  • Instala AURA
  • Vuelve a activar el antivirus
  • Agrega AURA a las excepciones del antivirus

Problema: AURA no abre después de instalar
Solución:
  • Click derecho en el ícono de AURA
  • Selecciona "Ejecutar como administrador"


📍 UBICACIÓN DE DATOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Base de datos:
C:\Users\[TuUsuario]\AppData\Roaming\AURA\aura-database.db

Backups:
C:\Users\[TuUsuario]\AppData\Roaming\AURA\backups\


📞 ¿Necesitas ayuda? Contacta a tu proveedor.

© 2026 AURA
EOF

# Instrucciones Completo
cat > dist-cliente/AURA-Instalador-Completo/LEEME.txt << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🏛️  AURA - Sistema de Gestión Funeraria           ║
║           INSTALADOR COMPLETO (Mac + Windows)                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝


📦 CONTENIDO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🍎 AURA-1.0.0-mac.dmg
   → Instalador para Mac (macOS)

🪟 AURA-Setup-1.0.0.exe
   → Instalador para Windows (PC)

📄 INSTRUCCIONES-MAC.txt
   → Guía de instalación para Mac

📄 INSTRUCCIONES-WINDOWS.txt
   → Guía de instalación para Windows


🚀 ¿QUÉ INSTALADOR USAR?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🍎 Si tienes Mac:
   → Usa: AURA-1.0.0-mac.dmg
   → Lee: INSTRUCCIONES-MAC.txt

🪟 Si tienes Windows:
   → Usa: AURA-Setup-1.0.0.exe
   → Lee: INSTRUCCIONES-WINDOWS.txt


🔐 CREDENCIALES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usuario: admin
Contraseña: admin123

⚠️ Cambia la contraseña después del primer inicio.


✨ CARACTERÍSTICAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Registro de servicios funerarios
✓ Control de cobros y abonos
✓ Generación de recibos imprimibles
✓ Dashboard con estadísticas
✓ Backups automáticos
✓ Funciona 100% offline


📞 SOPORTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para ayuda técnica, contacta a tu proveedor.


© 2026 AURA - Sistema de Gestión Funeraria
Versión 1.0.0
EOF

echo "✅ Instrucciones creadas"
echo ""

# 8. Comprimir paquetes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗜️  PASO 8/8: Comprimiendo paquetes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd dist-cliente

# Comprimir Mac
echo "📦 Comprimiendo paquete Mac..."
zip -r AURA-1.0.0-Instalador-Mac.zip AURA-Instalador-Mac -q
echo "✅ Mac: AURA-1.0.0-Instalador-Mac.zip"

# Comprimir Windows
echo "📦 Comprimiendo paquete Windows..."
zip -r AURA-1.0.0-Instalador-Windows.zip AURA-Instalador-Windows -q
echo "✅ Windows: AURA-1.0.0-Instalador-Windows.zip"

# Comprimir Completo
echo "📦 Comprimiendo paquete completo..."
zip -r AURA-1.0.0-Instalador-Completo.zip AURA-Instalador-Completo -q
echo "✅ Completo: AURA-1.0.0-Instalador-Completo.zip"

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡PAQUETES DE DISTRIBUCIÓN LISTOS!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Paquetes creados en: dist-cliente/"
echo ""
echo "🍎 SOLO MAC:"
echo "   • AURA-1.0.0-Instalador-Mac.zip"
echo "   • Contiene: DMG + instrucciones Mac"
echo "   • Tamaño: ~$(du -h dist-cliente/AURA-1.0.0-Instalador-Mac.zip | cut -f1)"
echo ""
echo "🪟 SOLO WINDOWS:"
echo "   • AURA-1.0.0-Instalador-Windows.zip"
echo "   • Contiene: EXE + instrucciones Windows"
echo "   • Tamaño: ~$(du -h dist-cliente/AURA-1.0.0-Instalador-Windows.zip | cut -f1)"
echo ""
echo "🌍 COMPLETO (Mac + Windows):"
echo "   • AURA-1.0.0-Instalador-Completo.zip"
echo "   • Contiene: DMG + EXE + instrucciones"
echo "   • Tamaño: ~$(du -h dist-cliente/AURA-1.0.0-Instalador-Completo.zip | cut -f1)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎁 ENVÍA A TUS CLIENTES:"
echo ""
echo "   • Cliente con Mac → AURA-1.0.0-Instalador-Mac.zip"
echo "   • Cliente con Windows → AURA-1.0.0-Instalador-Windows.zip"
echo "   • No sabes qué tiene → AURA-1.0.0-Instalador-Completo.zip"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Abrir la carpeta
open dist-cliente
