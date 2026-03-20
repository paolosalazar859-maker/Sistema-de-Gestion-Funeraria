# 🔧 Solución de Problemas - AURA

## 📋 Índice de Problemas

1. [Problemas con Git](#problemas-con-git)
2. [Problemas con GitHub](#problemas-con-github)
3. [Problemas con Electron](#problemas-con-electron)
4. [Problemas con Vercel](#problemas-con-vercel)
5. [Problemas de Build](#problemas-de-build)
6. [Problemas con Supabase](#problemas-con-supabase)

---

## 🔴 Problemas con Git

### Error: "git: command not found" o "git is not recognized"

**Causa:** Git no está instalado o no está en el PATH.

**Solución:**
```bash
# Windows: Descargar desde
https://git-scm.com/download/win

# macOS:
brew install git
# O descargar desde https://git-scm.com/download/mac

# Linux (Ubuntu/Debian):
sudo apt-get update
sudo apt-get install git

# Verificar instalación:
git --version
```

### Error: "Author identity unknown"

**Causa:** Git no sabe quién eres.

**Solución:**
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Verificar:
git config --list
```

### Error: "fatal: not a git repository"

**Causa:** No estás en un directorio con Git inicializado.

**Solución:**
```bash
# Inicializar Git
git init

# O navegar al directorio correcto
cd /ruta/a/aura-funeraria
```

### Error: "failed to push some refs"

**Causa:** Tu repositorio local está desincronizado con GitHub.

**Solución:**
```bash
# Opción 1: Pull con rebase
git pull origin main --rebase
git push origin main

# Opción 2: Pull normal
git pull origin main
git push origin main

# Opción 3: Forzar push (¡cuidado!)
git push origin main --force
```

---

## 🔴 Problemas con GitHub

### Error: "remote: Repository not found"

**Causa:** La URL del repositorio es incorrecta o no tienes permisos.

**Solución:**
```bash
# Ver remote actual
git remote -v

# Remover remote incorrecto
git remote remove origin

# Agregar remote correcto
git remote add origin https://github.com/TU-USUARIO/aura-funeraria.git

# Verificar
git remote -v

# Intentar push de nuevo
git push -u origin main
```

### Error: "Support for password authentication was removed"

**Causa:** GitHub ya no acepta contraseñas, necesitas un token.

**Solución:**

1. **Crear Personal Access Token:**
   - Ve a: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Nombre: "AURA Development"
   - Permisos: Marca **repo** (todos)
   - Click "Generate token"
   - **Copia el token** (no lo verás de nuevo)

2. **Usar el token:**
```bash
# Cuando Git pida contraseña, usa el token
git push

# Username: tu_usuario_github
# Password: ghp_xxxxxxxxxxxxxxxxxxxx (tu token)
```

3. **Guardar credenciales (opcional):**
```bash
# Para no tener que ingresar cada vez
git config --global credential.helper store
git push

# Ingresa usuario y token una vez, se guardará
```

### Error: "Permission denied (publickey)"

**Causa:** Problema con SSH keys.

**Solución:** Usar HTTPS en lugar de SSH:
```bash
# Cambiar remote a HTTPS
git remote set-url origin https://github.com/TU-USUARIO/aura-funeraria.git

# Verificar
git remote -v
```

---

## 🔴 Problemas con Electron

### Error: "Cannot find module 'electron'"

**Causa:** Electron no está instalado o se instaló incorrectamente.

**Solución:**
```bash
# Limpiar todo
rm -rf node_modules
rm package-lock.json

# Reinstalar
npm install

# Si persiste, instalar Electron manualmente
npm install --save-dev electron
```

### Error: "Electron failed to install correctly"

**Causa:** Problema al descargar binarios de Electron.

**Solución:**
```bash
# Opción 1: Reinstalar con cache limpio
npm cache clean --force
npm install

# Opción 2: Cambiar mirror de Electron
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
npm install electron --save-dev

# Opción 3: Descargar manualmente
npm install electron --force
```

### Error: "A JavaScript error occurred in the main process"

**Causa:** Error en electron.js o preload.js

**Solución:**
```bash
# Ver logs completos
npm run dev

# Revisar console para ver el error específico
# Verificar que electron.js y preload.js existen
# Verificar sintaxis de JavaScript
```

### Ventana de Electron en blanco

**Causa:** Vite no está corriendo o hay problema con la URL.

**Solución:**
```bash
# Verificar que Vite esté corriendo en puerto 5173
# Abrir DevTools en la ventana de Electron:
# Windows/Linux: Ctrl+Shift+I
# macOS: Cmd+Option+I

# Revisar errores en la consola
# Verificar en electron.js que la URL sea correcta:
mainWindow.loadURL('http://localhost:5173');
```

### Error: "Cannot create BrowserWindow before app is ready"

**Causa:** Intentando crear ventana antes de que Electron esté listo.

**Solución:**
Verificar en electron.js:
```javascript
app.whenReady().then(createWindow);
// No llamar createWindow() antes de app.whenReady()
```

---

## 🔴 Problemas con Vercel

### Error: "Build failed" en Vercel

**Causa:** Múltiples posibles causas.

**Solución:**

1. **Verificar que uses package-web.json:**
```bash
# Local
mv package.json package-electron.json
mv package-web.json package.json
git add package.json
git commit -m "Fix: usar package web"
git push
```

2. **Verificar configuración de build:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Ver logs detallados:**
   - En Vercel dashboard, click en el deployment fallido
   - Click en "View Function Logs"
   - Buscar el error específico

4. **Variables de entorno:**
   - Verificar que estén configuradas en Vercel
   - Verificar que los nombres sean exactos:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

### Error: "Module not found" en Vercel

**Causa:** Dependencia en devDependencies en lugar de dependencies.

**Solución:**
```bash
# Mover dependencias necesarias a dependencies
# Editar package.json:
# Mover las deps de "devDependencies" a "dependencies"

# O instalar correctamente:
npm install nombre-paquete --save
# No usar --save-dev para deps de producción

git add package.json
git commit -m "Fix: mover deps a production"
git push
```

### Error: "Out of memory" en Vercel

**Causa:** Build muy pesado.

**Solución:**

Agregar a `vercel.json`:
```json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max_old_space_size=4096"
    }
  }
}
```

### Vercel deploy exitoso pero app no funciona

**Causa:** Variables de entorno incorrectas.

**Solución:**
1. Ve a Vercel Dashboard
2. Tu proyecto → Settings → Environment Variables
3. Verifica:
   - `VITE_SUPABASE_URL` - Debe ser la URL completa
   - `VITE_SUPABASE_ANON_KEY` - Debe ser la key pública
4. Redeploy: Deployments → Click en el más reciente → "Redeploy"

---

## 🔴 Problemas de Build

### Error: "ENOENT: no such file or directory"

**Causa:** Archivo o directorio no existe.

**Solución:**
```bash
# Verificar estructura de carpetas
ls -la

# Si falta algo, verificar .gitignore
cat .gitignore

# Asegurarse que dist/ y node_modules/ están en .gitignore

# Limpiar y rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Error: "Port 5173 is already in use"

**Causa:** Otro proceso está usando el puerto.

**Solución:**

**Windows:**
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :5173

# Matar el proceso (reemplaza PID con el número que viste)
taskkill /PID numero /F

# O cambiar puerto en vite.config.ts:
server: {
  port: 5174
}
```

**macOS/Linux:**
```bash
# Ver qué proceso usa el puerto
lsof -i :5173

# Matar el proceso
kill -9 PID_NUMBER

# O cambiar puerto en vite.config.ts
```

### Error: "Cannot resolve module"

**Causa:** Import incorrecto o dependencia no instalada.

**Solución:**
```bash
# Verificar que la dependencia esté en package.json
cat package.json

# Si no está, instalarla
npm install nombre-dependencia

# Si está, reinstalar todo
rm -rf node_modules package-lock.json
npm install
```

### Build muy lento

**Causa:** Muchas dependencias o archivos grandes.

**Solución:**
```bash
# Limpiar cache de Vite
rm -rf node_modules/.vite

# Usar build rápido
npm run build -- --mode development

# O actualizar Vite
npm update vite
```

---

## 🔴 Problemas con Supabase

### Error: "Failed to fetch" al conectar con Supabase

**Causa:** Credenciales incorrectas o problema de CORS.

**Solución:**

1. **Verificar credenciales:**
```bash
# Ir a Supabase Dashboard
# Project Settings → API
# Verificar:
# - Project URL (debería terminar en .supabase.co)
# - anon public key (empieza con eyJ...)
```

2. **Verificar variables de entorno:**
```bash
# .env local
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...

# Vercel
# Settings → Environment Variables
# Verificar que sean las mismas
```

3. **Verificar CORS:**
   - En Supabase Dashboard
   - Settings → API
   - API Settings → CORS Allowed Origins
   - Agregar tu dominio de Vercel: `https://tu-app.vercel.app`

### Error: "Invalid API key"

**Causa:** Key incorrecta o expirada.

**Solución:**
```bash
# Regenerar keys en Supabase:
# Settings → API → Reset anon key

# Actualizar en código y en Vercel
```

### Error: "Table does not exist"

**Causa:** Tabla no creada en Supabase.

**Solución:**
```bash
# La tabla kv_store_d9afe8ad debe existir
# Verificar en Supabase:
# Table Editor → debería aparecer kv_store_d9afe8ad

# Si no existe, crearla con SQL Editor:
CREATE TABLE kv_store_d9afe8ad (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔴 Problemas Generales

### Aplicación lenta

**Solución:**
```bash
# Limpiar cache
rm -rf node_modules/.vite
rm -rf dist

# Rebuild
npm run build

# Para Electron
rm -rf release
npm run build:electron
```

### Errores en consola del navegador

**Solución:**
```bash
# Abrir DevTools: F12
# Ir a Console
# Buscar errores rojos
# Leer el mensaje completo
# Buscar el archivo y línea mencionados
```

### App funciona local pero no en producción

**Solución:**
1. Verificar variables de entorno
2. Verificar que el build sea correcto: `npm run build && npm run preview`
3. Ver logs de producción en Vercel
4. Verificar que no haya rutas absolutas en el código

---

## 📞 Obtener Ayuda Adicional

Si ninguna solución funcionó:

1. **Ver logs completos:**
```bash
# Git
git log --oneline

# NPM
npm run dev > debug.log 2>&1

# Vercel
vercel logs
```

2. **Información del sistema:**
```bash
node --version
npm --version
git --version

# Windows
systeminfo

# macOS/Linux
uname -a
```

3. **Crear Issue en GitHub:**
   - Ir a tu repositorio
   - Click en "Issues"
   - Describir el problema con:
     - ¿Qué intentaste hacer?
     - ¿Qué esperabas que pasara?
     - ¿Qué pasó realmente?
     - Logs de error completos
     - Sistema operativo y versiones

---

## ✅ Checklist de Diagnóstico

Cuando algo no funciona, verifica en orden:

- [ ] ¿Node.js está instalado? `node --version`
- [ ] ¿Git está instalado? `git --version`
- [ ] ¿Estás en el directorio correcto? `pwd`
- [ ] ¿Las dependencias están instaladas? `ls node_modules`
- [ ] ¿El package.json es el correcto? (web vs electron)
- [ ] ¿Hay errores en la terminal?
- [ ] ¿Hay errores en DevTools del navegador?
- [ ] ¿Las variables de entorno están configuradas?
- [ ] ¿Internet está funcionando?
- [ ] ¿Supabase está activo? (supabase.com)

---

**¡La mayoría de problemas se solucionan limpiando y reinstalando!**

```bash
rm -rf node_modules package-lock.json dist release
npm install
npm run dev
```

---

**AURA - Sistema de Gestión Funeraria** © 2026
