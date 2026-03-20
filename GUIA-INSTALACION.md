# 📦 GUÍA DE INSTALACIÓN - AURA

## Sistema de Gestión para Funeraria AURA
**Versión 1.0.0**

---

## 📋 REQUISITOS PREVIOS

### macOS
- macOS 10.13 (High Sierra) o superior
- 200 MB de espacio en disco

### Windows
- Windows 10/11 (64-bit)
- 200 MB de espacio en disco

### Linux
- Ubuntu 18.04 o superior / Debian 10 o superior
- 200 MB de espacio en disco

---

## 🚀 INSTRUCCIONES DE INSTALACIÓN

### 🍎 **macOS**

#### **Opción 1: Instalador DMG (Recomendado)**

1. **Descargar el instalador:**
   - Descarga `AURA-1.0.0-mac.dmg` desde la carpeta `release/`

2. **Instalar:**
   - Haz doble clic en el archivo `.dmg`
   - Arrastra el icono de AURA a la carpeta **Aplicaciones**
   - Espera a que termine la copia

3. **Primera ejecución:**
   - Abre **Aplicaciones** y busca **AURA**
   - Haz clic derecho → **Abrir** (la primera vez)
   - Si aparece advertencia de seguridad:
     - Ve a **Preferencias del Sistema** → **Seguridad y Privacidad**
     - Haz clic en **"Abrir de todas formas"**

4. **¡Listo!** La aplicación se abrirá automáticamente

---

### 🪟 **Windows**

#### **Opción 1: Instalador NSIS (Recomendado)**

1. **Descargar el instalador:**
   - Descarga `AURA-Setup-1.0.0.exe` desde la carpeta `release/`

2. **Ejecutar el instalador:**
   - Haz doble clic en el archivo `.exe`
   - Si aparece advertencia de **Windows Defender SmartScreen**:
     - Haz clic en **"Más información"**
     - Haz clic en **"Ejecutar de todas formas"**

3. **Instalación:**
   - Acepta los términos y condiciones
   - Elige la carpeta de instalación (por defecto: `C:\Program Files\AURA`)
   - Marca las opciones:
     - ✅ Crear acceso directo en el escritorio
     - ✅ Agregar al menú inicio
   - Haz clic en **"Instalar"**

4. **¡Listo!** Abre AURA desde:
   - Acceso directo en el escritorio
   - Menú Inicio → AURA

#### **Opción 2: Versión Portable**

1. **Descargar:**
   - Descarga `AURA-Setup-1.0.0.exe` (versión portable)

2. **Ejecutar directamente:**
   - Haz doble clic en el archivo
   - La aplicación se ejecuta sin instalación
   - Ideal para usar desde USB

---

### 🐧 **Linux**

#### **Opción 1: AppImage (Universal)**

1. **Descargar:**
   ```bash
   # Descarga AURA-1.0.0.AppImage desde release/
   ```

2. **Dar permisos de ejecución:**
   ```bash
   chmod +x AURA-1.0.0.AppImage
   ```

3. **Ejecutar:**
   ```bash
   ./AURA-1.0.0.AppImage
   ```

#### **Opción 2: Paquete .deb (Debian/Ubuntu)**

1. **Descargar:**
   ```bash
   # Descarga AURA-1.0.0.deb desde release/
   ```

2. **Instalar:**
   ```bash
   sudo dpkg -i AURA-1.0.0.deb
   sudo apt-get install -f  # Instalar dependencias
   ```

3. **Ejecutar:**
   ```bash
   aura
   ```
   O busca **AURA** en el menú de aplicaciones.

---

## 🏗️ COMPILAR DESDE EL CÓDIGO FUENTE

Si prefieres compilar la aplicación tú mismo:

### **Paso 1: Clonar o descargar el código**
```bash
cd /ruta/de/tu/proyecto
```

### **Paso 2: Instalar dependencias**
```bash
npm install
```

### **Paso 3: Compilar para tu plataforma**

#### **macOS:**
```bash
npm run build:mac
```

#### **Windows:**
```bash
npm run build:win
```

#### **Linux:**
```bash
npm run build:linux
```

### **Paso 4: Encontrar el instalador**
Los instaladores se generan en la carpeta:
```
release/
├── AURA-1.0.0-mac.dmg          # macOS DMG
├── AURA-1.0.0-mac.zip          # macOS ZIP
├── AURA-Setup-1.0.0.exe        # Windows Instalador
├── AURA-Setup-1.0.0.exe        # Windows Portable
├── AURA-1.0.0.AppImage         # Linux AppImage
└── AURA-1.0.0.deb              # Linux Debian
```

---

## 🔐 PRIMER USO

### **Credenciales por Defecto**

Al abrir AURA por primera vez, usa estas credenciales:

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Oficina:**
- Usuario: `oficina`
- Contraseña: `oficina123`

> ⚠️ **IMPORTANTE:** Cambia estas contraseñas inmediatamente después del primer inicio de sesión.

---

## 📁 UBICACIÓN DE LA BASE DE DATOS

La base de datos SQLite se guarda automáticamente en:

### **macOS:**
```
~/Library/Application Support/AURA/aura-database.db
```

### **Windows:**
```
C:\Users\TuUsuario\AppData\Roaming\AURA\aura-database.db
```

### **Linux:**
```
~/.config/AURA/aura-database.db
```

---

## 💾 BACKUPS AUTOMÁTICOS

Los backups se guardan en:

### **macOS:**
```
~/Library/Application Support/AURA/backups/
```

### **Windows:**
```
C:\Users\TuUsuario\AppData\Roaming\AURA\backups\
```

### **Linux:**
```
~/.config/AURA/backups/
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **La aplicación no abre (macOS)**

**Problema:** "AURA no se puede abrir porque es de un desarrollador no identificado"

**Solución:**
1. Ve a **Preferencias del Sistema** → **Seguridad y Privacidad**
2. En la pestaña **General**, haz clic en **"Abrir de todas formas"**
3. Ingresa tu contraseña de administrador

### **La aplicación no abre (Windows)**

**Problema:** Windows Defender bloquea la aplicación

**Solución:**
1. Haz clic en **"Más información"**
2. Haz clic en **"Ejecutar de todas formas"**

### **Error de base de datos**

**Problema:** No se puede crear o abrir la base de datos

**Solución:**
1. Cierra la aplicación
2. Elimina la carpeta de datos de AURA (ver ubicaciones arriba)
3. Vuelve a abrir la aplicación (se creará una nueva base de datos)

### **La aplicación se ve muy grande o muy pequeña**

**Solución:**
- Usa `Ctrl/Cmd + Plus` para acercar
- Usa `Ctrl/Cmd + Minus` para alejar
- Usa `Ctrl/Cmd + 0` para restablecer el zoom

---

## 🔄 ACTUALIZAR LA APLICACIÓN

La aplicación incluye un **sistema de actualizaciones automáticas**.

### **Actualización Automática:**
1. La aplicación busca actualizaciones cada hora
2. Si hay una nueva versión, se te notificará
3. Puedes descargar e instalar con un clic

### **Actualización Manual:**
1. Ingresa como **Administrador**
2. Ve a **Perfil** → **Actualizaciones**
3. Haz clic en **"Buscar actualizaciones"**

---

## 📞 SOPORTE

Si tienes problemas con la instalación:

1. Revisa esta guía completamente
2. Consulta la sección de **Solución de Problemas**
3. Contacta al equipo de desarrollo

---

## 📄 LICENCIA

© 2024-2026 AURA Funeraria. Todos los derechos reservados.

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] Descargar el instalador correcto para mi sistema operativo
- [ ] Ejecutar el instalador
- [ ] Abrir la aplicación por primera vez
- [ ] Iniciar sesión con credenciales por defecto
- [ ] Cambiar la contraseña del administrador
- [ ] Configurar backups automáticos
- [ ] Probar la funcionalidad básica

---

**¡Bienvenido a AURA!** 🎉
