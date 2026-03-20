# 🚀 Guía de Actualizaciones Automáticas - AURA

Esta guía te ayudará a configurar el sistema de actualizaciones automáticas para la aplicación AURA.

---

## 📋 **Tabla de Contenidos**

1. [Descripción General](#descripción-general)
2. [Configuración de GitHub](#configuración-de-github)
3. [Crear un Release](#crear-un-release)
4. [Probar las Actualizaciones](#probar-las-actualizaciones)
5. [Flujo de Actualización](#flujo-de-actualización)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 **Descripción General**

El sistema de actualizaciones automáticas de AURA utiliza:

- **electron-updater**: Maneja la lógica de actualización
- **GitHub Releases**: Hospeda los instaladores
- **Firma de código**: Verifica la autenticidad (opcional pero recomendado)

### **Características:**

✅ Verificación automática cada hora
✅ Descarga en segundo plano
✅ Notificaciones al usuario
✅ Instalación con un clic
✅ Actualización al cerrar la app

---

## ⚙️ **Configuración de GitHub**

### **1. Crear Repositorio**

```bash
# En tu proyecto local
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/aura-funeraria.git
git push -u origin main
```

### **2. Obtener GitHub Personal Access Token**

1. Ve a **GitHub.com** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Permisos necesarios:
   - ✅ `repo` (todos los permisos)
   - ✅ `write:packages`
4. Copia el token generado

### **3. Configurar Variable de Entorno**

```bash
# En tu archivo ~/.bashrc o ~/.zshrc
export GH_TOKEN="tu_token_aquí"

# O en cada sesión de terminal:
export GH_TOKEN="tu_token_aquí"
```

### **4. Actualizar electron-builder.json**

Edita `/electron-builder.json` y reemplaza:

```json
{
  "publish": {
    "provider": "github",
    "owner": "TU-USUARIO-GITHUB",  // ← Cambia esto
    "repo": "aura-funeraria",       // ← Y esto
    "releaseType": "release"
  }
}
```

---

## 📦 **Crear un Release**

### **Paso 1: Actualizar Versión en package.json**

```json
{
  "version": "1.0.1"  // Incrementa la versión
}
```

### **Paso 2: Compilar y Publicar**

```bash
# Asegúrate de que el token está configurado
echo $GH_TOKEN

# macOS
npm run publish:mac

# Windows
npm run publish:win

# Linux
npm run publish:linux
```

Esto hará:
1. ✅ Compilar el frontend con Vite
2. ✅ Empaquetar la aplicación con electron-builder
3. ✅ Crear un release en GitHub
4. ✅ Subir los instaladores

### **Paso 3: Verificar en GitHub**

1. Ve a tu repositorio en GitHub
2. Click en **"Releases"**
3. Deberías ver el nuevo release con los archivos:
   - `AURA-Funeraria-1.0.1.dmg` (macOS)
   - `AURA-Funeraria-Setup-1.0.1.exe` (Windows)
   - `AURA-Funeraria-1.0.1.AppImage` (Linux)

---

## 🧪 **Probar las Actualizaciones**

### **Escenario de Prueba:**

1. **Instalar versión 1.0.0:**
   ```bash
   # Cambiar versión en package.json a 1.0.0
   npm run build:mac
   # Instalar el .dmg generado
   ```

2. **Publicar versión 1.0.1:**
   ```bash
   # Cambiar versión en package.json a 1.0.1
   npm run publish:mac
   ```

3. **Abrir la app 1.0.0:**
   - Espera 5 segundos
   - Deberías ver una notificación: "Nueva versión 1.0.1 disponible"
   - Click en "Descargar Ahora"
   - Espera a que descargue
   - Click en "Instalar y Reiniciar"

---

## 🔄 **Flujo de Actualización**

```
┌─────────────────────────────────────────────────────────────┐
│  1. App Inicia                                              │
│     ↓                                                       │
│  2. Verifica actualizaciones (después de 5 segundos)       │
│     ↓                                                       │
│  3. Si hay actualización disponible:                       │
│     → Muestra diálogo al usuario                           │
│     → Usuario acepta descargar                             │
│     ↓                                                       │
│  4. Descarga en segundo plano                              │
│     → Muestra progreso (0% - 100%)                         │
│     ↓                                                       │
│  5. Actualización descargada:                              │
│     → Muestra diálogo "Instalar y Reiniciar"               │
│     → Usuario decide cuándo instalar                       │
│     ↓                                                       │
│  6. Instalación:                                           │
│     → Cierra la app                                        │
│     → Instala la nueva versión                             │
│     → Abre la app actualizada                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ **Solución de Problemas**

### **Error: "GH_TOKEN not found"**

```bash
# Verificar que el token está configurado
echo $GH_TOKEN

# Si está vacío, configúralo:
export GH_TOKEN="tu_token_aquí"
```

### **Error: "Cannot find module 'electron-updater'"**

```bash
npm install electron-updater
```

### **Error: "Repository not found"**

Verifica en `electron-builder.json`:
- ¿El `owner` es correcto?
- ¿El `repo` existe?
- ¿El token tiene permisos de `repo`?

### **La actualización no se detecta**

1. Verifica que la versión en GitHub es mayor que la instalada
2. Abre DevTools (Cmd+Option+I) y revisa la consola
3. Busca logs que empiecen con `🔍` o `✅`

### **Actualizaciones solo en Producción**

Las actualizaciones automáticas **SOLO funcionan** en la versión empaquetada:

```bash
# ✅ Funciona
npm run build:mac
# Instalar el .dmg

# ❌ NO funciona
npm run dev
```

---

## 📚 **Recursos Adicionales**

- [electron-updater Docs](https://www.electron.build/auto-update)
- [electron-builder Publishing](https://www.electron.build/configuration/publish)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

---

## ✨ **Comandos Rápidos**

```bash
# Publicar nueva versión (macOS)
npm version patch              # 1.0.0 → 1.0.1
npm run publish:mac

# Publicar nueva versión (Windows)
npm version patch
npm run publish:win

# Publicar nueva versión (Linux)
npm version patch
npm run publish:linux

# Publicar para todas las plataformas
npm version patch
npm run build:electron && electron-builder -mwl --publish always
```

---

## 🎉 **¡Listo!**

Ahora tu aplicación AURA puede actualizarse automáticamente. Los usuarios recibirán notificaciones cuando haya nuevas versiones disponibles.

**Recuerda:**
- Incrementar la versión en `package.json` antes de cada release
- Crear backups antes de actualizar
- Probar las actualizaciones en un entorno de prueba primero
