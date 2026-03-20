# 🚀 GUÍA DE INSTALACIÓN RÁPIDA - AURA

## ✅ CAMBIOS REALIZADOS

### 1. **Migración a HashRouter**
- ✅ Cambiado de `createBrowserRouter` a `createHashRouter`
- ✅ Las rutas ahora funcionan con `#` (ej: `file://.../#/registro`)
- ✅ Compatible con aplicaciones Electron empaquetadas

### 2. **ErrorBoundary Mejorado**
- ✅ Componente `ErrorBoundary` para capturar errores globales
- ✅ Componente `RouteErrorPage` para errores de rutas 404
- ✅ Mensajes de error amigables y profesionales

### 3. **Scripts de Instalación Optimizados**
- ✅ `postinstall`: Reconstruye dependencias nativas automáticamente
- ✅ `rebuild`: Script manual para reconstruir better-sqlite3

---

## 📦 COMPILAR E INSTALAR

### **PASO 1: Compilar el Instalador**

```bash
npm run build:mac
```

⏱️ **Tiempo estimado:** 5-8 minutos

**Salida esperada:**
```
✓ built in XXX ms
• electron-builder  version=25.1.8
• building        target=DMG arch=x64 file=release/AURA-1.0.0-mac.dmg
```

---

### **PASO 2: Verificar Archivos Generados**

```bash
ls -lh release/
```

**Deberías ver:**
```
AURA-1.0.0-mac.dmg   ← 🎯 INSTALADOR PRINCIPAL (Distribución)
AURA-1.0.0-mac.zip   ← Archivo comprimido de la app
mac/
  └── AURA.app       ← Aplicación sin empaquetar
```

---

### **PASO 3: Desinstalar Versión Anterior**

```bash
# Eliminar app anterior
rm -rf /Applications/AURA.app

# Limpiar datos (OPCIONAL - solo si quieres empezar de cero)
rm -rf ~/Library/Application\ Support/AURA

# Limpiar preferencias
rm -rf ~/Library/Preferences/com.aura.funeraria.plist
```

---

### **PASO 4: Instalar Nueva Versión**

#### **Opción A: Instalación Gráfica (Recomendado)**

1. Abre **Finder**
2. Ve a la carpeta del proyecto: `release/`
3. Haz **doble clic** en **AURA-1.0.0-mac.dmg**
4. Se abrirá una ventana, **arrastra AURA.app** a la carpeta **Aplicaciones**

#### **Opción B: Instalación por Terminal**

```bash
# Abrir el DMG
open release/AURA-1.0.0-mac.dmg

# Espera 3-5 segundos a que se monte, luego:
cp -r /Volumes/AURA\ 1.0.0/AURA.app /Applications/

# Desmontar el DMG
hdiutil detach "/Volumes/AURA 1.0.0"
```

---

### **PASO 5: Remover Cuarentena de macOS**

```bash
# Quitar el bloqueo de seguridad de macOS
xattr -cr /Applications/AURA.app
```

**⚠️ IMPORTANTE:** Este paso es **necesario** porque macOS bloquea apps de desarrolladores no identificados.

---

### **PASO 6: Abrir AURA**

```bash
open /Applications/AURA.app
```

O desde **Launchpad** → busca **AURA** → haz clic.

---

## ✅ VERIFICACIÓN POST-INSTALACIÓN

### **1. Pantalla de Login**

Deberías ver:
- ✅ Formulario con **Usuario** y **Contraseña**
- ✅ Colores AURA (gris oscuro, azul marino, dorado)
- ✅ **SIN errores 404**

**Credenciales por defecto:**
```
Usuario: admin
Contraseña: admin123
```

---

### **2. Navegación**

Las URLs ahora usan **hash (#)**:

```
Dashboard:  file:///.../index.html#/
Registro:   file:///.../index.html#/registro
Cobros:     file:///.../index.html#/cobros
Clientes:   file:///.../index.html#/clientes
Perfil:     file:///.../index.html#/perfil
```

---

### **3. Funcionalidades a Probar**

#### **Registro de Servicio**
- ✅ Crear servicio nuevo
- ✅ Formato de montos: `xxx.xxx.xxx` (con puntos)
- ✅ Guardar y ver en lista

#### **Estado de Cobros**
- ✅ Ver lista de servicios
- ✅ Agregar abono
- ✅ Generar recibo imprimible

#### **Dashboard**
- ✅ Ver gráficos de recaudación
- ✅ Estadísticas actualizadas

#### **Backups (Perfil → Backups)**
- ✅ Crear backup manual
- ✅ Configurar backups automáticos
- ✅ Listar backups disponibles
- ✅ Abrir carpeta de backups

#### **Actualizaciones (Perfil → Actualizaciones)**
- ✅ Ver versión actual
- ✅ Verificar actualizaciones
- ✅ Configurar verificación automática

---

## 📂 UBICACIONES IMPORTANTES

### **Base de Datos**
```
~/Library/Application Support/AURA/aura-database.db
```

### **Backups**
```
~/Library/Application Support/AURA/backups/
```

### **Logs**
```
~/Library/Logs/AURA/
```

### **Preferencias**
```
~/Library/Preferences/com.aura.funeraria.plist
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Problema: "AURA no se puede abrir porque es de un desarrollador no identificado"**

**Solución 1: Desde Terminal**
```bash
xattr -cr /Applications/AURA.app
open /Applications/AURA.app
```

**Solución 2: Desde Preferencias del Sistema**
1. Ve a **Preferencias del Sistema** → **Privacidad y Seguridad**
2. En la sección **Seguridad**, haz clic en **"Abrir de todos modos"**

---

### **Problema: Error 404 o pantalla en blanco**

**✅ Ya corregido con HashRouter**

Si aún persiste:
1. Cierra AURA completamente
2. Limpia los datos de la app:
   ```bash
   rm -rf ~/Library/Application\ Support/AURA
   ```
3. Abre AURA nuevamente

---

### **Problema: Base de datos SQLite no disponible**

```bash
# Reconstruir better-sqlite3 para Electron
cd /ruta/del/proyecto
npm run rebuild

# Si el error persiste:
npm install better-sqlite3 --build-from-source
```

---

## 🎯 COMANDOS RÁPIDOS - RESUMEN

```bash
# 1. Compilar
npm run build:mac

# 2. Desinstalar anterior
rm -rf /Applications/AURA.app

# 3. Instalar nueva
open release/AURA-1.0.0-mac.dmg
# (Arrastra AURA.app a Aplicaciones)

# 4. Remover cuarentena
xattr -cr /Applications/AURA.app

# 5. Abrir
open /Applications/AURA.app
```

---

## 📤 DISTRIBUIR EL DMG

Para distribuir AURA a otros usuarios:

1. **Copia el archivo DMG:**
   ```bash
   cp release/AURA-1.0.0-mac.dmg ~/Desktop/
   ```

2. **Comparte el DMG** con otros usuarios vía:
   - ✅ Correo electrónico
   - ✅ USB
   - ✅ Dropbox / Google Drive
   - ✅ Servidor web

3. **Instrucciones para usuarios finales:**
   - Doble clic en el DMG
   - Arrastrar AURA.app a Aplicaciones
   - Si macOS bloquea la app, ir a Preferencias → Privacidad y Seguridad → "Abrir de todos modos"

---

## 🚀 PRÓXIMOS PASOS

### **Configurar Actualizaciones Automáticas**

1. Crear repositorio en GitHub
2. Habilitar GitHub Releases
3. Configurar `GH_TOKEN` en el entorno
4. Publicar nueva versión:
   ```bash
   npm run publish:mac
   ```

Ver más detalles en: `GUIA-ACTUALIZACIONES.md`

---

## ✅ CHECKLIST FINAL

Antes de dar por finalizada la instalación:

- [ ] AURA se abre sin errores
- [ ] Login funciona correctamente
- [ ] Dashboard muestra gráficos
- [ ] Se pueden registrar servicios
- [ ] Se pueden agregar abonos
- [ ] Los montos se formatean con puntos (xxx.xxx)
- [ ] Se pueden crear backups
- [ ] La navegación entre secciones funciona
- [ ] No aparece error 404
- [ ] Los datos persisten después de cerrar la app

---

## 📞 SOPORTE

Si encuentras algún problema:

1. **Revisa los logs de Electron:**
   ```bash
   tail -f ~/Library/Logs/AURA/main.log
   ```

2. **Verifica la base de datos:**
   ```bash
   ls -lh ~/Library/Application\ Support/AURA/
   ```

3. **Recompila las dependencias nativas:**
   ```bash
   npm run rebuild
   ```

---

© 2026 AURA - Sistema de Gestión Funeraria
