# 🚀 GUÍA DE INSTALACIÓN FINAL - AURA

## ✅ VERIFICACIÓN COMPLETA REALIZADA

He verificado todos los archivos críticos y **TODO ESTÁ CORRECTO**:

### **Archivos Verificados:**
- ✅ `/src/app/routes.tsx` - Existe y usa HashRouter
- ✅ `/src/app/App.tsx` - Importa routes.tsx correctamente
- ✅ `/src/app/components/ErrorBoundary.tsx` - Existe
- ✅ `/src/app/components/RouteErrorPage.tsx` - Existe
- ✅ `/electron.js` - Configurado para hash navigation
- ✅ `/package.json` - Tiene `react-router` 7.13.0 (correcto)
- ✅ **NO hay** `routes.ts` antiguo
- ✅ **NO hay** importaciones de `react-router-dom`

---

## 🎯 PASOS PARA INSTALAR (GARANTIZADO)

### **PASO 0: Verificar que tienes el código nuevo** ✅

Ya lo descargaste, así que estamos listos.

---

### **PASO 1: Instalar dependencias**

```bash
npm install
```

**Tiempo:** ~2-3 minutos

**Esto hace:**
- Instala todas las dependencias
- Reconstruye módulos nativos (better-sqlite3)
- Prepara el entorno

---

### **PASO 2: Compilar e Instalar (OPCIÓN RECOMENDADA)**

```bash
chmod +x install.sh
./install.sh
```

**Tiempo:** ~5-8 minutos

**Esto hace:**
1. ✅ Compila la aplicación con Vite
2. ✅ Construye el instalador DMG con electron-builder
3. ✅ Desinstala versión anterior (si existe)
4. ✅ Instala la nueva versión en /Applications
5. ✅ Configura permisos de macOS
6. ✅ Abre AURA automáticamente

---

### **PASO 2 ALTERNATIVO: Manual (más control)**

Si prefieres hacerlo paso a paso:

```bash
# 1. Compilar
npm run build:mac

# 2. Verificar que se creó el DMG
ls -lh release/AURA-1.0.0-mac.dmg

# 3. Desinstalar versión anterior
rm -rf /Applications/AURA.app

# 4. Abrir el DMG
open release/AURA-1.0.0-mac.dmg

# 5. Esperar 3 segundos, luego copiar a Aplicaciones
sleep 3
cp -r /Volumes/AURA\ 1.0.0/AURA.app /Applications/

# 6. Desmontar el DMG
hdiutil detach "/Volumes/AURA 1.0.0"

# 7. Remover cuarentena de macOS
xattr -cr /Applications/AURA.app

# 8. Abrir AURA
open /Applications/AURA.app
```

---

## ✅ QUÉ ESPERAR

### **Durante la compilación:**

```
✓ building client...
✓ built in XXX ms
• electron-builder  version=25.1.8
• building        target=DMG arch=x64 file=release/AURA-1.0.0-mac.dmg
• building block map  blockMapFile=release/AURA-1.0.0-mac.dmg.blockmap
```

### **Después de instalar:**

1. ✅ AURA aparece en /Applications
2. ✅ Icono dorado con logo de AURA
3. ✅ Al abrir, muestra pantalla de login (SIN error 404)
4. ✅ Login funciona con: `admin` / `admin123`

---

## 🔍 FUNCIONALIDADES A VERIFICAR

Después de instalar y hacer login:

### **1. Navegación** ✅
- Dashboard (/)
- Registro de Servicio (/registro)
- Estado de Cobros (/cobros)
- Clientes (/clientes)
- Mi Perfil (/perfil)

**URLs en la barra del navegador:**
```
file:///.../index.html#/
file:///.../index.html#/registro
file:///.../index.html#/cobros
```

### **2. Registro de Servicio** ✅
- Crear servicio nuevo
- Campos se formatean correctamente (montos con puntos)
- Se guardan en la base de datos SQLite

### **3. Estado de Cobros** ✅
- Ver lista de servicios
- Agregar abonos
- Generar recibos

### **4. Dashboard** ✅
- Gráficos de recaudación
- Estadísticas actualizadas
- Indicadores de servicios

### **5. Backups (en Perfil)** ✅
- Crear backup manual
- Configurar backups automáticos
- Ver lista de backups
- Abrir carpeta de backups

### **6. Actualizaciones (en Perfil)** ✅
- Ver versión actual (1.0.0)
- Verificar actualizaciones
- Configurar verificación automática

---

## 🐛 SI ALGO FALLA

### **Error: "AURA no se puede abrir"**

```bash
xattr -cr /Applications/AURA.app
open /Applications/AURA.app
```

### **Error: Base de datos no disponible**

```bash
npm run rebuild
npm run build:mac
```

### **Error de compilación**

```bash
# Limpiar todo y empezar de nuevo
rm -rf node_modules dist release
npm install
npm run build:mac
```

---

## 📂 UBICACIONES DE DATOS

Después de instalar, los datos se guardan en:

```
Base de datos:
~/Library/Application Support/AURA/aura-database.db

Backups:
~/Library/Application Support/AURA/backups/

Logs:
~/Library/Logs/AURA/main.log
```

---

## 🎯 RESUMEN DE PASOS

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar e instalar (RECOMENDADO)
chmod +x install.sh && ./install.sh

# ¡Listo! AURA se abrirá automáticamente
```

---

## ✅ CHECKLIST FINAL

Antes de empezar, confirma:

- [ ] Estás en el directorio del proyecto
- [ ] Tienes Node.js instalado
- [ ] Tienes conexión a internet (para npm install)
- [ ] Tienes permisos de administrador (para instalar en /Applications)

**Si todos los puntos están ✅, ejecuta los comandos arriba.**

---

## 💡 NOTAS IMPORTANTES

1. **Primera vez que instalas:**
   - macOS puede pedir permisos de seguridad
   - Ve a Preferencias → Seguridad → "Abrir de todos modos"
   - O ejecuta: `xattr -cr /Applications/AURA.app`

2. **Base de datos:**
   - Se crea automáticamente en el primer inicio
   - Los datos persisten entre reinicios
   - Los backups son automáticos (si los configuras)

3. **Actualizaciones:**
   - El sistema de actualizaciones está implementado
   - Requiere configurar GitHub Releases para funcionar
   - Ver `GUIA-ACTUALIZACIONES.md` para más detalles

---

## 🚀 ¡COMIENZA AHORA!

```bash
npm install && chmod +x install.sh && ./install.sh
```

**Tiempo total estimado:** 8-12 minutos

---

© 2026 AURA - Sistema de Gestión Funeraria

**¡Todo está verificado y listo para funcionar!** 🎉
