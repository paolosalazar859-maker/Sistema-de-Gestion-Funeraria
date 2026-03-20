#!/bin/bash

# 🎁 Script para preparar AURA para distribución a clientes
# Este script crea un paquete listo para enviar

set -e

echo "🎁 Preparando AURA para distribución..."
echo ""

# 1. Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf dist release dist-cliente
echo "✅ Limpieza completada"
echo ""

# 2. Compilar la aplicación
echo "🔨 Compilando AURA..."
npm run build
echo "✅ Compilación completada"
echo ""

# 3. Construir el DMG
echo "📦 Construyendo instalador DMG..."
npm run build:mac
echo "✅ DMG creado"
echo ""

# 4. Crear carpeta de distribución
echo "📁 Creando paquete de distribución..."
mkdir -p dist-cliente/AURA-Instalador
echo "✅ Carpeta creada"
echo ""

# 5. Copiar el DMG
echo "📋 Copiando instalador..."
cp release/AURA-1.0.0-mac.dmg dist-cliente/AURA-Instalador/
echo "✅ Instalador copiado"
echo ""

# 5.1. Copiar instalador automático para el cliente
echo "📋 Copiando instalador automático..."
cp instalar-para-cliente.sh dist-cliente/AURA-Instalador/
chmod +x dist-cliente/AURA-Instalador/instalar-para-cliente.sh
echo "✅ Instalador automático incluido"
echo ""

# 5.2. Copiar manual del cliente
echo "📋 Copiando manual..."
cp MANUAL-CLIENTE.txt dist-cliente/AURA-Instalador/
echo "✅ Manual incluido"
echo ""

# 6. Crear instrucciones para el cliente
echo "📝 Creando instrucciones..."
cat > dist-cliente/AURA-Instalador/INSTRUCCIONES-INSTALACION.txt << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🏛️  AURA - Sistema de Gestión Funeraria           ║
║                    GUÍA DE INSTALACIÓN                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📋 REQUISITOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ macOS 10.13 (High Sierra) o superior
✓ Al menos 500 MB de espacio libre
✓ Permisos de administrador


🚀 PASOS DE INSTALACIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASO 1: Abrir el instalador
   → Doble click en: AURA-1.0.0-mac.dmg

PASO 2: Instalar AURA
   → Arrastra el ícono de AURA a la carpeta Aplicaciones
   → Espera a que termine de copiar

PASO 3: Abrir AURA por primera vez
   → Ve a Aplicaciones
   → Busca AURA
   → Click derecho → "Abrir"
   → Click en "Abrir" en el mensaje de seguridad

   ⚠️  IMPORTANTE: La primera vez DEBES usar "Click derecho → Abrir"
       para autorizar la aplicación en macOS


🔐 CREDENCIALES INICIALES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Usuario:    admin
Contraseña: admin123

⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio


📍 UBICACIÓN DE DATOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base de datos:
   ~/Library/Application Support/AURA/aura-database.db

Backups automáticos:
   ~/Library/Application Support/AURA/backups/


🆘 SOLUCIÓN DE PROBLEMAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problema: "No se puede abrir porque es de un desarrollador no identificado"
Solución: 
   1. Ve a: Preferencias del Sistema → Seguridad y Privacidad
   2. Click en "Abrir de todos modos"
   3. O usa: Click derecho en AURA → "Abrir"

Problema: La app no abre
Solución:
   1. Abre Terminal (Aplicaciones → Utilidades → Terminal)
   2. Copia y pega este comando:
      xattr -cr /Applications/AURA.app && open /Applications/AURA.app
   3. Presiona Enter

Problema: Error de base de datos
Solución:
   1. Cierra AURA
   2. Abre AURA de nuevo (se crea la base de datos automáticamente)


✨ FUNCIONALIDADES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Registro completo de servicios funerarios
✓ Control de cobros y abonos
✓ Generación de recibos imprimibles
✓ Dashboard con estadísticas y gráficos
✓ Gestión de clientes
✓ Backups automáticos de base de datos
✓ Sistema de actualizaciones integrado
✓ Funciona 100% offline (sin internet)


📞 SOPORTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Para soporte técnico, contacta a tu proveedor.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2026 AURA - Sistema de Gestión Funeraria
Versión 1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo "✅ Instrucciones creadas"
echo ""

# 7. Crear README técnico
cat > dist-cliente/AURA-Instalador/LEEME.txt << 'EOF'
🏛️  AURA - Sistema de Gestión Funeraria
════════════════════════════════════════════════════════════

CONTENIDO DE ESTE PAQUETE:
─────────────────────────────────────────────────────────────
📦 AURA-1.0.0-mac.dmg         → Instalador de AURA
📄 INSTRUCCIONES-INSTALACION.txt → Guía paso a paso
📄 LEEME.txt                  → Este archivo

INSTALACIÓN RÁPIDA:
─────────────────────────────────────────────────────────────
1. Abre AURA-1.0.0-mac.dmg
2. Arrastra AURA a Aplicaciones
3. Click derecho en AURA → "Abrir"
4. Login: admin / admin123

CARACTERÍSTICAS:
─────────────────────────────────────────────────────────────
✓ Sistema completo de gestión funeraria
✓ Base de datos local (SQLite)
✓ Sin necesidad de internet
✓ Backups automáticos
✓ Interfaz moderna y profesional
✓ Reportes y estadísticas

REQUISITOS:
─────────────────────────────────────────────────────────────
• macOS 10.13 o superior
• 500 MB de espacio libre
• Permisos de administrador

SOPORTE:
─────────────────────────────────────────────────────────────
Lee INSTRUCCIONES-INSTALACION.txt para más detalles.

© 2026 AURA
EOF

echo "✅ README creado"
echo ""

# 8. Comprimir todo
echo "🗜️  Comprimiendo paquete..."
cd dist-cliente
zip -r AURA-1.0.0-Instalador.zip AURA-Instalador
cd ..
echo "✅ Paquete comprimido"
echo ""

# 9. Mostrar resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡PAQUETE DE DISTRIBUCIÓN LISTO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Paquete creado en:"
echo "   dist-cliente/AURA-1.0.0-Instalador.zip"
echo ""
echo "📋 Contenido:"
echo "   • AURA-1.0.0-mac.dmg (instalador)"
echo "   • INSTRUCCIONES-INSTALACION.txt"
echo "   • LEEME.txt"
echo "   • instalar-para-cliente.sh"
echo "   • MANUAL-CLIENTE.txt"
echo ""
echo "🎁 Envía este ZIP a tu cliente"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Abrir la carpeta
open dist-cliente