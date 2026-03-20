# 🎁 CÓMO DISTRIBUIR AURA A TUS CLIENTES

## ⚡ RESUMEN ULTRA-RÁPIDO

```bash
# 1. Preparar paquete para cliente (5-8 minutos)
chmod +x preparar-distribucion.sh
./preparar-distribucion.sh

# 2. Enviar el archivo resultante
# → dist-cliente/AURA-1.0.0-Instalador.zip
```

**¡Eso es todo!** 🎉

---

## 📦 ¿QUÉ HACE EL SCRIPT?

El script `preparar-distribucion.sh` crea automáticamente un paquete ZIP que incluye:

```
AURA-1.0.0-Instalador.zip
└── AURA-Instalador/
    ├── AURA-1.0.0-mac.dmg              ← Instalador principal
    ├── instalar-para-cliente.sh        ← Instalador automático
    ├── INSTRUCCIONES-INSTALACION.txt   ← Guía paso a paso
    ├── MANUAL-CLIENTE.txt              ← Manual completo
    └── LEEME.txt                       ← Resumen rápido
```

---

## 🚀 PASOS COMPLETOS

### **PARA TI (Preparar el paquete):**

#### **Paso 1: Ejecutar el script**

```bash
chmod +x preparar-distribucion.sh
./preparar-distribucion.sh
```

**Esto hace:**
- ✅ Compila AURA
- ✅ Crea el instalador DMG
- ✅ Genera instrucciones para el cliente
- ✅ Empaqueta todo en un ZIP
- ✅ Abre la carpeta con el resultado

**Tiempo:** ~5-8 minutos

---

#### **Paso 2: Enviar al cliente**

El archivo resultante está en:
```
dist-cliente/AURA-1.0.0-Instalador.zip
```

**Opciones de envío:**

**A) Email** (si es < 25 MB):
- Adjunta el ZIP y listo

**B) Google Drive / Dropbox:**
1. Sube el ZIP
2. Crea enlace público
3. Envía el enlace

**C) WeTransfer** (recomendado):
1. Ve a https://wetransfer.com
2. Sube el ZIP
3. Envía el enlace

**D) USB / Disco:**
- Copia el ZIP directamente

---

### **PARA EL CLIENTE (Instalación):**

El cliente tiene **3 opciones** de instalación:

---

#### **OPCIÓN A: Instalador Automático** ⚡ (Más fácil)

1. Descomprimir `AURA-1.0.0-Instalador.zip`
2. Abrir Terminal en la carpeta
3. Ejecutar:
```bash
chmod +x instalar-para-cliente.sh
./instalar-para-cliente.sh
```

**¡LISTO!** AURA se instala y abre automáticamente.

---

#### **OPCIÓN B: Instalación Manual** 🖱️ (Más común)

1. Descomprimir `AURA-1.0.0-Instalador.zip`
2. Doble click en `AURA-1.0.0-mac.dmg`
3. Arrastrar AURA a Aplicaciones
4. **Click derecho** en AURA → "Abrir"
5. Login: `admin` / `admin123`

**Tiempo:** ~2 minutos

---

#### **OPCIÓN C: Seguir Instrucciones** 📖

1. Abrir `INSTRUCCIONES-INSTALACION.txt`
2. Seguir los pasos detallados

---

## 📧 PLANTILLA DE EMAIL

Copia y pega esto cuando envíes AURA:

```
Asunto: Instalador AURA - Sistema de Gestión Funeraria

Hola [Nombre],

Adjunto el instalador de AURA, tu sistema de gestión funeraria.

📦 INSTALACIÓN RÁPIDA (2 minutos):

1. Descomprime el archivo ZIP
2. Abre AURA-1.0.0-mac.dmg
3. Arrastra AURA a Aplicaciones
4. Click derecho en AURA → "Abrir" (¡importante!)

🔐 CREDENCIALES:
Usuario: admin
Contraseña: admin123

⚠️ Cambia la contraseña después del primer inicio.

📄 El paquete incluye:
• Instalador DMG
• Manual completo (MANUAL-CLIENTE.txt)
• Instrucciones detalladas
• Script de instalación automática

✨ FUNCIONALIDADES:
✓ Registro de servicios funerarios
✓ Control de cobros y abonos
✓ Generación de recibos
✓ Backups automáticos
✓ Funciona 100% offline

¿Necesitas ayuda? Contáctame.

Saludos,
[Tu Nombre]
```

---

## 🎯 ESCENARIOS COMUNES

### **Escenario 1: Cliente técnico**

Envía el ZIP + email simple:
```
"Adjunto AURA. Abre el DMG, arrastra a Aplicaciones,
click derecho → Abrir. Login: admin/admin123"
```

---

### **Escenario 2: Cliente no técnico**

Envía el ZIP + email detallado + llama por teléfono:
```
"Te envié un archivo ZIP. Descárgalo, descomprímelo,
y dame una llamada para guiarte en la instalación."
```

---

### **Escenario 3: Instalación remota**

Usa TeamViewer/AnyDesk:
1. Conéctate al Mac del cliente
2. Descarga el ZIP
3. Ejecuta `instalar-para-cliente.sh`
4. **Hecho en 3 minutos**

---

## 🆘 PROBLEMAS COMUNES DEL CLIENTE

### **"No se puede abrir porque es de un desarrollador no identificado"**

**Solución 1:**
```
1. Click derecho en AURA (en Aplicaciones)
2. Seleccionar "Abrir"
3. Click en "Abrir" en el mensaje
```

**Solución 2:**
```
1. Preferencias del Sistema → Seguridad
2. Click en "Abrir de todos modos"
```

**Solución 3 (Terminal):**
```bash
xattr -cr /Applications/AURA.app
open /Applications/AURA.app
```

---

### **"La app está dañada y no se puede abrir"**

**Solución:**
```bash
xattr -cr /Applications/AURA.app
open /Applications/AURA.app
```

---

### **"No encuentro cómo abrir Terminal"**

**Solución:**
```
1. Abre Finder
2. Ve a: Aplicaciones → Utilidades → Terminal
3. O usa Spotlight: Cmd + Espacio → escribe "Terminal"
```

---

## 🔄 ACTUALIZACIONES FUTURAS

Cuando hagas cambios en AURA:

### **Paso 1: Actualizar versión**

```json
// En package.json:
"version": "1.1.0",  // Cambia de 1.0.0 a 1.1.0
```

### **Paso 2: Regenerar paquete**

```bash
./preparar-distribucion.sh
```

### **Paso 3: Enviar nueva versión**

El cliente instala igual que antes:
- ✅ **Los datos NO se pierden**
- ✅ Servicios, clientes y configuraciones se mantienen
- ✅ Solo se actualiza la aplicación

---

## 💰 DISTRIBUIR PROFESIONALMENTE (Opcional)

Si quieres eliminar la advertencia de "desarrollador no identificado":

### **Opción A: Firma de código con Apple ($99/año)**

1. Inscríbete en Apple Developer Program
2. Obtén certificado de firma
3. Firma y notariza la app
4. El cliente instala sin advertencias

**Pros:**
- ✅ Instalación más limpia
- ✅ Más confianza
- ✅ Actualizaciones automáticas

**Contras:**
- ❌ Costo anual de $99
- ❌ Proceso de configuración más complejo

---

### **Opción B: Distribuir sin firma (Gratis)**

La opción actual funciona perfectamente:
- ✅ Gratis
- ✅ Funcional al 100%
- ✅ El cliente solo hace "click derecho → Abrir" una vez

**Recomendado para:**
- Pocos clientes (1-10)
- Clientes conocidos
- Presupuesto limitado

---

## 📊 COMPARACIÓN

| Aspecto | Sin Firma (Actual) | Con Firma Apple |
|---------|-------------------|-----------------|
| **Costo** | Gratis | $99/año |
| **Setup** | 5 min | 1-2 días |
| **Cliente ve advertencia** | Sí (primera vez) | No |
| **Instalación cliente** | Click derecho | Doble click |
| **Funcionalidad** | 100% | 100% |
| **Recomendado para** | 1-10 clientes | 10+ clientes |

---

## ✅ CHECKLIST ANTES DE ENVIAR

Antes de enviar el paquete al cliente:

- [ ] Ejecutaste `./preparar-distribucion.sh` sin errores
- [ ] El ZIP se creó en `dist-cliente/`
- [ ] Probaste el instalador en tu Mac
- [ ] Login funciona (admin/admin123)
- [ ] Preparaste email con instrucciones básicas
- [ ] Tienes plan de soporte si hay problemas

---

## 🎉 RESUMEN FINAL

### **Para distribuir AURA a un cliente:**

```bash
# 1. Preparar paquete (5-8 min)
./preparar-distribucion.sh

# 2. Enviar archivo (1 min)
# → Sube dist-cliente/AURA-1.0.0-Instalador.zip

# 3. Cliente instala (2 min)
# → Descomprime → Abre DMG → Arrastra a Apps → Click derecho "Abrir"
```

**Tiempo total:** ~10 minutos  
**Costo:** $0  
**Resultado:** Cliente usando AURA ✅

---

## 💡 SIGUIENTE PASO

**¿Listo para preparar el paquete?**

Ejecuta:
```bash
chmod +x preparar-distribucion.sh
./preparar-distribucion.sh
```

En 8 minutos tendrás el paquete listo para enviar. 🚀

---

© 2026 AURA - Sistema de Gestión Funeraria
