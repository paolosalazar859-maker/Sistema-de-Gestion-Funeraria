# 🎁 GUÍA COMPLETA: DISTRIBUIR AURA PARA MAC Y WINDOWS

## ⚡ RESUMEN ULTRA-RÁPIDO

```bash
# Crear instaladores para Mac y Windows (10-15 minutos)
chmod +x preparar-distribucion-completa.sh
./preparar-distribucion-completa.sh
```

**Resultado:** 3 paquetes ZIP listos para enviar
- 🍎 Solo Mac
- 🪟 Solo Windows  
- 🌍 Completo (ambos)

---

## 📦 ¿QUÉ SE CREA?

### **Paquete 1: Solo Mac** 🍎
```
AURA-1.0.0-Instalador-Mac.zip (~80 MB)
└── AURA-Instalador-Mac/
    ├── AURA-1.0.0-mac.dmg           ← Instalador
    ├── instalar-para-cliente.sh     ← Instalador automático
    ├── INSTRUCCIONES-MAC.txt        ← Guía paso a paso
    └── MANUAL-CLIENTE-MAC.txt       ← Manual completo
```

### **Paquete 2: Solo Windows** 🪟
```
AURA-1.0.0-Instalador-Windows.zip (~100 MB)
└── AURA-Instalador-Windows/
    ├── AURA-Setup-1.0.0.exe         ← Instalador
    ├── INSTRUCCIONES-WINDOWS.txt    ← Guía paso a paso
    └── MANUAL-CLIENTE-WINDOWS.txt   ← Manual completo
```

### **Paquete 3: Completo** 🌍
```
AURA-1.0.0-Instalador-Completo.zip (~180 MB)
└── AURA-Instalador-Completo/
    ├── AURA-1.0.0-mac.dmg           ← Mac
    ├── AURA-Setup-1.0.0.exe         ← Windows
    ├── instalar-para-cliente.sh     ← Script Mac
    ├── INSTRUCCIONES-MAC.txt        ← Guía Mac
    ├── INSTRUCCIONES-WINDOWS.txt    ← Guía Windows
    └── LEEME.txt                    ← Índice
```

---

## 🚀 PASOS COMPLETOS

### **PASO 1: Preparar tu entorno**

⚠️ **IMPORTANTE:** Solo puedes crear el instalador de Mac desde una Mac.

**Requisitos:**
- ✅ Estás en una Mac (para crear ambos instaladores)
- ✅ Node.js instalado
- ✅ Conexión a internet (para npm install)
- ✅ Al menos 2 GB de espacio libre

---

### **PASO 2: Ejecutar el script de distribución**

```bash
chmod +x preparar-distribucion-completa.sh
./preparar-distribucion-completa.sh
```

**Qué hace:**
1. ✅ Compila la aplicación con Vite
2. ✅ Construye instalador DMG para Mac
3. ✅ Construye instalador EXE para Windows
4. ✅ Crea 3 paquetes ZIP separados
5. ✅ Incluye instrucciones para cada plataforma
6. ✅ Abre la carpeta con los resultados

**Tiempo:** ~10-15 minutos

---

### **PASO 3: Verificar los paquetes**

En la carpeta `dist-cliente/` verás:

```
dist-cliente/
├── AURA-1.0.0-Instalador-Mac.zip       (~80 MB)
├── AURA-1.0.0-Instalador-Windows.zip   (~100 MB)
└── AURA-1.0.0-Instalador-Completo.zip  (~180 MB)
```

---

### **PASO 4: Decidir qué enviar**

| Situación | Envía |
|-----------|-------|
| Cliente tiene Mac | `AURA-1.0.0-Instalador-Mac.zip` |
| Cliente tiene Windows | `AURA-1.0.0-Instalador-Windows.zip` |
| No sabes qué tiene | `AURA-1.0.0-Instalador-Completo.zip` |
| Oficina mixta (Mac + Windows) | `AURA-1.0.0-Instalador-Completo.zip` |

---

### **PASO 5: Enviar al cliente**

**Opciones de envío:**

#### **A) Google Drive** (Recomendado)
1. Sube el ZIP a tu Drive
2. Click derecho → "Compartir"
3. "Cualquiera con el enlace"
4. Copia el enlace y envíalo

#### **B) WeTransfer** (Fácil y rápido)
1. Ve a https://wetransfer.com
2. Arrastra el ZIP
3. Ingresa email del cliente
4. Click en "Transferir"

#### **C) Dropbox**
1. Sube a Dropbox
2. Click en "Compartir"
3. Crea enlace público
4. Envía el enlace

#### **D) Email** (Solo si es < 25 MB)
- Adjunta el ZIP directamente

#### **E) USB / Disco duro**
- Copia el ZIP al dispositivo físico

---

## 📧 PLANTILLAS DE EMAIL

### **Para cliente con Mac:**

```
Asunto: Instalador AURA para Mac - Sistema de Gestión Funeraria

Hola [Nombre],

Te envío el instalador de AURA para tu Mac.

📦 INSTALACIÓN (2 minutos):
1. Descarga y descomprime el ZIP
2. Abre AURA-1.0.0-mac.dmg
3. Arrastra AURA a Aplicaciones
4. Click DERECHO en AURA → "Abrir" (¡importante!)

🔐 CREDENCIALES:
Usuario: admin
Contraseña: admin123

⚠️ Cambia la contraseña inmediatamente después del primer inicio.

📄 El paquete incluye instrucciones detalladas.

🔗 Enlace de descarga: [TU_ENLACE_AQUI]

¿Necesitas ayuda? Llámame o escríbeme.

Saludos,
[Tu Nombre]
[Tu Teléfono]
```

---

### **Para cliente con Windows:**

```
Asunto: Instalador AURA para Windows - Sistema de Gestión Funeraria

Hola [Nombre],

Te envío el instalador de AURA para tu PC con Windows.

📦 INSTALACIÓN (3 minutos):
1. Descarga y descomprime el ZIP
2. Doble click en AURA-Setup-1.0.0.exe
3. Si aparece "Windows protegió tu PC":
   • Click en "Más información"
   • Click en "Ejecutar de todas formas"
4. Sigue el asistente (Siguiente, Siguiente, Instalar)

🔐 CREDENCIALES:
Usuario: admin
Contraseña: admin123

⚠️ Cambia la contraseña inmediatamente después del primer inicio.

📄 El paquete incluye instrucciones detalladas.

🔗 Enlace de descarga: [TU_ENLACE_AQUI]

¿Necesitas ayuda? Llámame o escríbeme.

Saludos,
[Tu Nombre]
[Tu Teléfono]
```

---

### **Para cliente (no sabes qué sistema tiene):**

```
Asunto: Instalador AURA - Sistema de Gestión Funeraria

Hola [Nombre],

Te envío el instalador de AURA. El paquete incluye versiones para Mac y Windows.

📦 INSTALACIÓN:

🍎 Si tienes Mac:
   → Usa: AURA-1.0.0-mac.dmg
   → Lee: INSTRUCCIONES-MAC.txt

🪟 Si tienes Windows:
   → Usa: AURA-Setup-1.0.0.exe
   → Lee: INSTRUCCIONES-WINDOWS.txt

🔐 CREDENCIALES (ambos):
Usuario: admin
Contraseña: admin123

⚠️ Cambia la contraseña después del primer inicio.

🔗 Enlace de descarga: [TU_ENLACE_AQUI]

📄 El archivo LEEME.txt dentro del paquete explica qué usar según tu sistema.

¿Necesitas ayuda? Llámame o escríbeme.

Saludos,
[Tu Nombre]
[Tu Teléfono]
```

---

## 🆘 SOPORTE AL CLIENTE

### **Problemas comunes en Mac:**

#### **"No se puede abrir porque es de un desarrollador no identificado"**
```
1. Click DERECHO en AURA (en Aplicaciones)
2. Seleccionar "Abrir"
3. Click en "Abrir" en el mensaje
```

O por Terminal:
```bash
xattr -cr /Applications/AURA.app && open /Applications/AURA.app
```

---

### **Problemas comunes en Windows:**

#### **"Windows protegió tu PC"**
```
1. Click en "Más información"
2. Click en "Ejecutar de todas formas"
```

#### **Antivirus bloquea la instalación**
```
1. Desactiva temporalmente el antivirus
2. Instala AURA
3. Reactiva el antivirus
4. Agrega AURA a excepciones
```

#### **Error "VCRUNTIME140.dll falta"**
```
Descarga e instala Visual C++ Redistributable:
https://aka.ms/vs/17/release/vc_redist.x64.exe
```

---

## 🔄 ACTUALIZACIONES FUTURAS

### **Cambiar versión:**

```json
// En package.json:
"version": "1.1.0",  // Era 1.0.0
```

### **Regenerar paquetes:**

```bash
./preparar-distribucion-completa.sh
```

### **Enviar a clientes:**

**Los datos NO se pierden**  
✅ Servicios se mantienen  
✅ Clientes se mantienen  
✅ Configuraciones se mantienen  

---

## 📊 COMPARACIÓN DE INSTALADORES

| Aspecto | Mac (DMG) | Windows (EXE) |
|---------|-----------|---------------|
| **Tamaño** | ~80 MB | ~100 MB |
| **Tiempo instalación** | 2 min | 3 min |
| **Advertencia sistema** | Sí (primera vez) | Sí (Windows Defender) |
| **Requiere admin** | No | Sí |
| **Actualiza automáticamente** | Sí | Sí |
| **Datos persisten** | Sí | Sí |

---

## 💰 OPCIONES PROFESIONALES

### **Distribución actual (Gratis):**
- ✅ Funcional al 100%
- ⚠️ Advertencias de seguridad
- ✅ Clientes deben hacer un paso extra

### **Distribución firmada ($99/año + $299/año):**

#### **Mac: Apple Developer Program**
- $99/año
- Firma de código con certificado Apple
- Sin advertencias de seguridad
- Notarización con Apple

#### **Windows: Certificado de firma de código**
- $299-$699/año (según proveedor)
- Firma con certificado Authenticode
- Sin advertencias de SmartScreen
- Necesario para distribución comercial

**¿Vale la pena?**
- 1-10 clientes → NO, usa versión gratis
- 10+ clientes → SÍ, mejora experiencia
- Venta comercial → SÍ, es necesario

---

## ✅ CHECKLIST ANTES DE ENVIAR

- [ ] Ejecuté `preparar-distribucion-completa.sh`
- [ ] Verifiqué que se crearon los 3 ZIP
- [ ] Probé el instalador Mac en mi Mac
- [ ] (Opcional) Probé el instalador Windows en una VM/PC
- [ ] Verifiqué que el login funciona (admin/admin123)
- [ ] Elegí el paquete correcto para mi cliente
- [ ] Subí el ZIP a Drive/WeTransfer
- [ ] Preparé email con instrucciones
- [ ] Estoy disponible para soporte

---

## 📍 UBICACIÓN DE DATOS POR PLATAFORMA

### **Mac:**
```
Base de datos:
~/Library/Application Support/AURA/aura-database.db

Backups:
~/Library/Application Support/AURA/backups/
```

### **Windows:**
```
Base de datos:
C:\Users\[Usuario]\AppData\Roaming\AURA\aura-database.db

Backups:
C:\Users\[Usuario]\AppData\Roaming\AURA\backups\
```

---

## 🎯 ESCENARIOS DE USO

### **Escenario 1: Funeraria con 1 PC (Windows)**
```bash
./preparar-distribucion-completa.sh
# Envía: AURA-1.0.0-Instalador-Windows.zip
# Tamaño: ~100 MB
```

### **Escenario 2: Funeraria con 1 Mac**
```bash
./preparar-distribucion-completa.sh
# Envía: AURA-1.0.0-Instalador-Mac.zip
# Tamaño: ~80 MB
```

### **Escenario 3: Funeraria con oficina mixta**
```bash
./preparar-distribucion-completa.sh
# Envía: AURA-1.0.0-Instalador-Completo.zip
# Instalan según su sistema
# Datos sincronizables (futuro)
```

### **Escenario 4: Múltiples funerarias**
```bash
./preparar-distribucion-completa.sh
# Envía paquete completo a todos
# Cada uno instala según su sistema
```

---

## ⏱️ TIEMPOS ESTIMADOS

| Actividad | Mac | Windows | Ambos |
|-----------|-----|---------|-------|
| Compilar | 5 min | 5 min | 10 min |
| Crear paquete | 1 min | 1 min | 2 min |
| Subir (Drive) | 2 min | 3 min | 5 min |
| Cliente descarga | 1 min | 2 min | 3 min |
| Cliente instala | 2 min | 3 min | - |
| **TOTAL** | **11 min** | **14 min** | **20 min** |

---

## 🎉 RESUMEN EJECUTIVO

### **Para distribuir AURA a clientes:**

```bash
# 1. Crear instaladores (10-15 min)
chmod +x preparar-distribucion-completa.sh
./preparar-distribucion-completa.sh

# 2. Resultado:
# dist-cliente/
#   ├── AURA-1.0.0-Instalador-Mac.zip (80 MB)
#   ├── AURA-1.0.0-Instalador-Windows.zip (100 MB)
#   └── AURA-1.0.0-Instalador-Completo.zip (180 MB)

# 3. Enviar según el sistema del cliente

# 4. Cliente instala en 2-3 minutos
```

**Costo:** $0  
**Funcionalidad:** 100%  
**Compatible:** Mac + Windows  

---

## 💡 SIGUIENTE PASO

**¿Listo para crear los instaladores?**

```bash
chmod +x preparar-distribucion-completa.sh
./preparar-distribucion-completa.sh
```

**En 15 minutos tendrás instaladores para Mac y Windows listos para enviar.** 🚀

---

© 2026 AURA - Sistema de Gestión Funeraria
