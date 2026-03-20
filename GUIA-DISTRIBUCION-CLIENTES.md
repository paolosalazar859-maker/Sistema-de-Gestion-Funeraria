# 🎁 GUÍA COMPLETA: DISTRIBUIR AURA A CLIENTES

## 📦 OPCIÓN 1: DISTRIBUCIÓN SIMPLE (Recomendada para empezar)

### **Para ti (Preparar el paquete):**

#### **1. Ejecuta el script de distribución:**

```bash
chmod +x preparar-distribucion.sh
./preparar-distribucion.sh
```

**Esto crea automáticamente:**
- ✅ Instalador DMG
- ✅ Instrucciones detalladas para el cliente
- ✅ Todo comprimido en un ZIP listo para enviar

**Tiempo:** ~5-8 minutos

---

#### **2. Resultado:**

Se crea un archivo:
```
dist-cliente/AURA-1.0.0-Instalador.zip
```

**Contenido del ZIP:**
```
AURA-Instalador/
├── AURA-1.0.0-mac.dmg          ← Instalador
├── INSTRUCCIONES-INSTALACION.txt ← Guía paso a paso
└── LEEME.txt                    ← Resumen rápido
```

---

#### **3. Enviar al cliente:**

**Opciones de envío:**

**A) Email (si es menor a 25 MB):**
- Adjunta `AURA-1.0.0-Instalador.zip`
- Incluye instrucciones básicas

**B) Google Drive / Dropbox:**
1. Sube `AURA-1.0.0-Instalador.zip`
2. Crea enlace compartido
3. Envía el enlace al cliente

**C) WeTransfer (recomendado para archivos grandes):**
1. Ve a https://wetransfer.com
2. Sube el ZIP
3. Envía el enlace al cliente

**D) USB / Disco duro:**
- Copia el ZIP directamente

---

### **Para el cliente (Instalación):**

El cliente solo necesita:

#### **PASO 1: Descargar y descomprimir**
- Descargar el ZIP que le enviaste
- Doble click para descomprimir

#### **PASO 2: Abrir el instalador**
- Doble click en `AURA-1.0.0-mac.dmg`

#### **PASO 3: Instalar**
- Arrastra el ícono de AURA a la carpeta "Aplicaciones"

#### **PASO 4: Abrir AURA (IMPORTANTE)**
⚠️ La primera vez debe usar:
1. Ir a Aplicaciones
2. **Click derecho** en AURA
3. Seleccionar **"Abrir"**
4. Click en **"Abrir"** en el mensaje de seguridad

#### **PASO 5: Login**
```
Usuario:    admin
Contraseña: admin123
```

**¡Listo! Ya está funcionando.** ✅

---

## 🏆 OPCIÓN 2: DISTRIBUCIÓN PROFESIONAL (Con firma de código)

### **¿Por qué firmar el código?**

✅ **Ventajas:**
- No aparece advertencia de "desarrollador no identificado"
- El cliente puede abrir con doble click normal
- Más profesional y seguro
- Compatible con App Store y Gatekeeper

❌ **Requiere:**
- Apple Developer Program ($99/año)
- Certificado de firma de código
- Proceso de notarización con Apple

---

### **Pasos para firma profesional:**

#### **1. Inscribirse en Apple Developer Program**

1. Ve a https://developer.apple.com
2. Inscríbete en el programa ($99/año)
3. Espera aprobación (1-2 días)

---

#### **2. Crear certificado de firma**

```bash
# En Xcode, ve a:
# Preferences → Accounts → Manage Certificates → +
# Selecciona: "Developer ID Application"
```

---

#### **3. Configurar electron-builder**

```json
// En package.json, agregar:
"build": {
  "mac": {
    "identity": "Developer ID Application: Tu Nombre (TEAM_ID)",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  },
  "afterSign": "scripts/notarize.js"
}
```

---

#### **4. Notarizar con Apple**

```bash
# Después de construir, notarizar:
xcrun notarytool submit AURA-1.0.0-mac.dmg \
  --apple-id tu@email.com \
  --team-id TEAM_ID \
  --password "contraseña-app-specific"
```

---

## 📊 COMPARACIÓN DE OPCIONES

| Aspecto | Simple | Profesional |
|---------|--------|-------------|
| **Costo** | Gratis | $99/año |
| **Tiempo setup** | 5 min | 1-2 días |
| **Advertencia macOS** | Sí | No |
| **Instalación cliente** | Click derecho | Doble click |
| **Actualizaciones** | Manual | Automáticas |
| **Recomendado para** | Pruebas, clientes conocidos | Producción, muchos clientes |

---

## 🎯 RECOMENDACIÓN SEGÚN TU CASO

### **Si tienes 1-5 clientes:**
→ **Usa OPCIÓN 1 (Simple)**
- Es gratis
- Funciona perfectamente
- Los clientes solo necesitan "click derecho → abrir" una vez
- Puedes actualizar más adelante

### **Si tienes 10+ clientes o vendes comercialmente:**
→ **Usa OPCIÓN 2 (Profesional)**
- Instalación más limpia
- Actualizaciones automáticas
- Más confianza del cliente
- Vale la pena la inversión

---

## 📝 PLANTILLA DE EMAIL PARA CLIENTES

```
Asunto: Instalador AURA - Sistema de Gestión Funeraria

Hola [Nombre del Cliente],

Adjunto encontrarás el instalador de AURA, tu nuevo sistema de 
gestión funeraria.

📦 INSTALACIÓN RÁPIDA:
1. Descarga y descomprime el archivo ZIP
2. Abre AURA-1.0.0-mac.dmg
3. Arrastra AURA a Aplicaciones
4. Click derecho en AURA → "Abrir" (solo la primera vez)

🔐 CREDENCIALES INICIALES:
Usuario: admin
Contraseña: admin123

⚠️ IMPORTANTE: Cambia la contraseña después del primer inicio.

📄 El paquete incluye instrucciones detalladas en 
INSTRUCCIONES-INSTALACION.txt

✨ CARACTERÍSTICAS:
- Registro completo de servicios
- Control de cobros y abonos
- Generación de recibos
- Backups automáticos
- Funciona 100% offline

¿Necesitas ayuda con la instalación? Contáctame.

Saludos,
[Tu Nombre]
```

---

## 🔄 ACTUALIZACIONES FUTURAS

### **Cuando hagas cambios en AURA:**

#### **1. Actualizar versión:**

```json
// En package.json:
"version": "1.1.0",  // Era 1.0.0
```

---

#### **2. Regenerar el paquete:**

```bash
./preparar-distribucion.sh
```

---

#### **3. Enviar al cliente:**

**Instrucciones para el cliente:**
```
1. Cierra AURA (si está abierto)
2. Instala la nueva versión (igual que antes)
3. Los datos se mantienen automáticamente
```

**Los datos NO se pierden** porque están en:
```
~/Library/Application Support/AURA/
```

---

## 🎁 BONUS: Hacer el proceso aún más fácil

### **Crear instalador con script automático:**

Puedes crear un instalador que haga todo automáticamente para el cliente:

```bash
# Script que puede ejecutar el cliente:
#!/bin/bash
open AURA-1.0.0-mac.dmg
sleep 3
cp -r /Volumes/AURA\ 1.0.0/AURA.app /Applications/
xattr -cr /Applications/AURA.app
open /Applications/AURA.app
```

Pero esto requiere que el cliente ejecute un script, lo cual puede ser menos intuitivo.

---

## ✅ CHECKLIST PARA DISTRIBUCIÓN

Antes de enviar al cliente, verifica:

- [ ] Compilaste con `./preparar-distribucion.sh`
- [ ] Probaste el instalador en tu Mac
- [ ] Verificaste que el login funciona (admin/admin123)
- [ ] Incluiste INSTRUCCIONES-INSTALACION.txt
- [ ] El ZIP es menor a 100 MB (para emails)
- [ ] Preparaste email con instrucciones básicas
- [ ] Tienes plan de soporte si el cliente tiene problemas

---

## 🆘 PROBLEMAS COMUNES Y SOLUCIONES

### **Cliente reporta: "No se puede abrir"**

**Solución 1 (Recomendada):**
Pídele que use "click derecho → Abrir"

**Solución 2 (Si no funciona):**
Envíale este comando para Terminal:
```bash
xattr -cr /Applications/AURA.app && open /Applications/AURA.app
```

---

### **Cliente reporta: "La app está dañada"**

**Causa:** macOS Gatekeeper bloqueando apps sin firma

**Solución:**
```bash
sudo spctl --master-disable
# (Desactiva Gatekeeper temporalmente)
```

O considera firmar el código (Opción 2).

---

### **El DMG es muy grande (>100 MB)**

**Soluciones:**
1. Usa WeTransfer o Google Drive
2. Optimiza la build:
```bash
# En electron-builder, agregar compresión:
"mac": {
  "target": "dmg",
  "compression": "maximum"
}
```

---

## 🎯 RESUMEN EJECUTIVO

### **Para empezar HOY (gratis, 10 minutos):**

```bash
# 1. Preparar paquete
chmod +x preparar-distribucion.sh
./preparar-distribucion.sh

# 2. Enviar a cliente
# → Sube dist-cliente/AURA-1.0.0-Instalador.zip a Drive/WeTransfer

# 3. Cliente instala
# → Descomprime → Abre DMG → Arrastra a Aplicaciones → Click derecho "Abrir"
```

**¡Listo! Tu cliente ya puede usar AURA.** ✅

---

### **Para producción profesional (necesitas tiempo y $99):**

1. Inscríbete en Apple Developer Program
2. Configura firma de código
3. Notariza con Apple
4. Distribuye sin advertencias

---

## 📞 SIGUIENTE PASO

**¿Quieres distribuir AHORA?**

Ejecuta:
```bash
chmod +x preparar-distribucion.sh
./preparar-distribucion.sh
```

Y en 10 minutos tendrás el paquete listo para enviar.

---

© 2026 AURA - Sistema de Gestión Funeraria
