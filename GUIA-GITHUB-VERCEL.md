# 📚 Guía Paso a Paso: GitHub y Vercel

## 🎯 Parte 1: Subir a GitHub

### Opción A: Usando la Terminal (Recomendado)

#### 1. Abrir Terminal
- **Windows:** Git Bash (instalado con Git) o PowerShell
- **macOS/Linux:** Terminal

#### 2. Navegar a tu proyecto
```bash
cd /ruta/a/tu/proyecto/aura-funeraria
```

#### 3. Configurar Git (solo primera vez)
```bash
# Configurar tu nombre
git config --global user.name "Tu Nombre"

# Configurar tu email (el mismo de GitHub)
git config --global user.email "tu@email.com"

# Verificar configuración
git config --list
```

#### 4. Crear repositorio en GitHub
1. Ve a https://github.com
2. Inicia sesión
3. Click en el **+** (arriba derecha) → "New repository"
4. Completa:
   - **Repository name:** `aura-funeraria`
   - **Description:** "Sistema de Gestión Funeraria"
   - **Visibility:** Private (recomendado) o Public
   - **NO marcar** "Initialize this repository with a README"
5. Click **"Create repository"**

#### 5. Copiar la URL del repositorio
Verás algo como:
```
https://github.com/TU-USUARIO/aura-funeraria.git
```
**¡Copia esta URL!**

#### 6. Conectar tu proyecto local con GitHub

```bash
# Inicializar Git en tu proyecto
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: Sistema AURA completo"

# Conectar con GitHub (reemplaza la URL con la tuya)
git remote add origin https://github.com/TU-USUARIO/aura-funeraria.git

# Verificar que se conectó
git remote -v

# Subir el código
git push -u origin main
```

Si Git te pide usuario y contraseña:
- **Usuario:** Tu usuario de GitHub
- **Contraseña:** Personal Access Token (ver sección siguiente)

#### 7. Crear Personal Access Token (si es necesario)

GitHub ya no acepta contraseñas, necesitas un token:

1. Ve a: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Nombre: "AURA Development"
4. Permisos: Marca **repo** (todos los sub-checkboxes)
5. Click "Generate token"
6. **¡COPIA EL TOKEN!** (no lo verás de nuevo)
7. Usa este token como "contraseña" cuando Git te lo pida

#### 8. Verificar que subió correctamente

1. Ve a tu repositorio: `https://github.com/TU-USUARIO/aura-funeraria`
2. Deberías ver todos los archivos
3. El README.md se mostrará automáticamente

### Opción B: Usando GitHub Desktop (Más Fácil)

#### 1. Descargar GitHub Desktop
- Ve a: https://desktop.github.com
- Descarga e instala

#### 2. Iniciar sesión
- Abre GitHub Desktop
- Click "Sign in to GitHub.com"
- Ingresa tu usuario y contraseña

#### 3. Agregar tu proyecto
- Click "File" → "Add Local Repository"
- Click "Choose..." y selecciona la carpeta de AURA
- Si dice "not a Git repository", click "Create a repository"
- Completa:
  - **Name:** aura-funeraria
  - **Local Path:** Ruta a tu proyecto
  - Click "Create Repository"

#### 4. Hacer el primer commit
- Verás todos los archivos en la lista
- Abajo a la izquierda:
  - **Summary:** "Initial commit: Sistema AURA"
  - Click **"Commit to main"**

#### 5. Publicar en GitHub
- Click **"Publish repository"**
- Desmarcar "Keep this code private" si quieres que sea público
- Click **"Publish Repository"**

#### 6. ¡Listo!
- Tu código está en GitHub
- Puedes verlo en: `https://github.com/TU-USUARIO/aura-funeraria`

---

## 🚀 Parte 2: Deploy en Vercel

### Método 1: Desde la Web (Más Fácil)

#### 1. Crear cuenta en Vercel
- Ve a: https://vercel.com/signup
- Click "Continue with GitHub"
- Autoriza Vercel a acceder a GitHub

#### 2. Importar proyecto
- En el dashboard de Vercel, click **"Add New..."** → **"Project"**
- Verás una lista de tus repositorios de GitHub
- Busca `aura-funeraria` y click **"Import"**

#### 3. Configurar el proyecto
Vercel detectará automáticamente Vite, pero verifica:
- **Framework Preset:** Vite
- **Root Directory:** `./` (dejar como está)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### 4. Agregar Variables de Entorno
- Click en **"Environment Variables"**
- Agregar estas variables:

```
Name: VITE_SUPABASE_URL
Value: (pegar tu URL de Supabase)

Name: VITE_SUPABASE_ANON_KEY
Value: (pegar tu key de Supabase)
```

Para obtener las credenciales de Supabase:
1. Ve a tu proyecto en https://supabase.com
2. Settings → API
3. Copia `Project URL` y `anon public`

#### 5. Deploy
- Click **"Deploy"**
- Espera 2-3 minutos (verás logs en tiempo real)
- Cuando termine, verás: "🎉 Congratulations!"
- Click en el botón **"Visit"** para ver tu app

#### 6. Tu app está en línea!
Tendrás una URL como:
```
https://sistema-funeraria-v2.vercel.app
```
o
```
https://sistema-funeraria-v2.vercel.app
```

### Método 2: Usando Vercel CLI

#### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login
```bash
vercel login
```
Te abrirá el navegador para confirmar

#### 3. Deploy
```bash
# Navegar a tu proyecto
cd /ruta/a/aura-funeraria

# Deploy (primera vez)
vercel

# Seguir las instrucciones:
# - Set up and deploy? Yes
# - Which scope? Tu usuario
# - Link to existing project? No
# - Project name? aura-funeraria
# - Directory? ./
# - Want to override settings? No
```

#### 4. Deploy a Producción
```bash
vercel --prod
```

---

## 🔄 Parte 3: Workflow Diario

### Cuando hagas cambios en el código

#### Usando Terminal:
```bash
# Ver qué archivos cambiaron
git status

# Agregar todos los cambios
git add .

# O agregar archivos específicos
git add src/app/components/Dashboard.tsx

# Guardar cambios con un mensaje descriptivo
git commit -m "Add: nueva funcionalidad en dashboard"

# Subir a GitHub
git push

# Vercel detectará el cambio y hará deploy automáticamente ✨
```

#### Usando GitHub Desktop:
1. Abre GitHub Desktop
2. Verás la lista de cambios a la izquierda
3. Abajo:
   - **Summary:** Descripción breve del cambio
   - Click **"Commit to main"**
4. Click **"Push origin"** (arriba)
5. Vercel hará deploy automáticamente ✨

### Ver el progreso del deploy

1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto "aura-funeraria"
3. Verás el historial de deploys
4. Click en cualquier deploy para ver logs

---

## 📦 Parte 4: Generar Instaladores de Escritorio

### Preparación (una sola vez)

#### 1. Cambiar a versión Electron

**Windows:**
```cmd
switch-version.bat
# Elegir opción 2 (Electron)
```

**macOS/Linux:**
```bash
bash switch-version.sh
# Elegir opción 2 (Electron)
```

O manualmente:
```bash
mv package.json package-web.json
mv package-electron.json package.json
```

#### 2. Instalar dependencias
```bash
npm install
```

Esto instalará Electron y electron-builder (puede tardar unos minutos)

#### 3. Probar en desarrollo
```bash
npm run dev
```
Debería abrirse una ventana con la aplicación

### Generar Instaladores

#### Para Windows:
```bash
npm run build:win
```
Genera en `release/`:
- `AURA-Setup-1.0.0.exe` - Instalador completo
- `AURA-1.0.0.exe` - Versión portable (no requiere instalación)

**Tiempo estimado:** 3-5 minutos

#### Para macOS (solo desde macOS):
```bash
npm run build:mac
```
Genera en `release/`:
- `AURA-1.0.0.dmg` - Imagen de disco
- `AURA-1.0.0-mac.zip` - Archivo comprimido

#### Para Linux:
```bash
npm run build:linux
```
Genera en `release/`:
- `AURA-1.0.0.AppImage` - Universal (ejecutable directo)
- `AURA-1.0.0.deb` - Para Ubuntu/Debian
- `AURA-1.0.0.rpm` - Para Fedora/RedHat

#### Para todas las plataformas:
```bash
npm run build:all
```

**Nota:** Para compilar para macOS, DEBES estar en una Mac.

---

## 📤 Parte 5: Distribuir Instaladores

### Opción 1: GitHub Releases (Recomendado)

#### 1. Crear una nueva versión

```bash
# Crear tag de versión
git tag v1.0.0

# Subir tag a GitHub
git push origin v1.0.0
```

#### 2. Crear Release en GitHub

1. Ve a tu repositorio: `https://github.com/TU-USUARIO/aura-funeraria`
2. Click en **"Releases"** (derecha, bajo "About")
3. Click **"Create a new release"**
4. Completa:
   - **Tag:** Selecciona `v1.0.0`
   - **Release title:** `AURA v1.0.0 - Release Inicial`
   - **Description:** 
     ```
     ## 🎉 Primera versión de AURA
     
     ### Características:
     - ✅ Dashboard con gráficos de recaudación
     - ✅ Registro completo de servicios
     - ✅ Estado de cobros con recibos
     - ✅ Gestión de clientes
     - ✅ PWA con modo offline
     - ✅ Sistema de roles (Admin/Oficina)
     
     ### Descargas disponibles:
     - Windows: AURA-Setup-1.0.0.exe
     - macOS: AURA-1.0.0.dmg
     - Linux: AURA-1.0.0.AppImage
     ```
5. Arrastra los archivos desde `release/` al área "Attach binaries"
6. Marca **"This is a pre-release"** si aún estás probando
7. Click **"Publish release"**

#### 3. Compartir link de descarga

Tu release estará en:
```
https://github.com/TU-USUARIO/aura-funeraria/releases
```

Los usuarios podrán descargar directamente desde ahí.

### Opción 2: Google Drive / Dropbox

1. Sube los archivos de `release/` a una carpeta
2. Crea un link compartido
3. Comparte el link

### Opción 3: Sitio web propio

Si tienes hosting, sube los instaladores y crea una página de descarga.

---

## 🆘 Solución de Problemas Comunes

### Error: "git is not recognized"
**Solución:** Instala Git desde https://git-scm.com

### Error: "remote: Repository not found"
**Solución:** 
```bash
# Verificar remote
git remote -v

# Si está mal, cambiar
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/aura-funeraria.git
```

### Error: "Support for password authentication was removed"
**Solución:** Necesitas crear un Personal Access Token (ver Parte 1, paso 7)

### Error al hacer push: "failed to push some refs"
**Solución:**
```bash
# Traer cambios primero
git pull origin main --rebase

# Luego subir
git push origin main
```

### Error en build de Electron: "Cannot find module 'electron'"
**Solución:**
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 5173 is already in use"
**Solución:**
```bash
# Cerrar otros procesos de Vite
# O cambiar el puerto en vite.config.ts:
server: {
  port: 5174
}
```

### Vercel deploy falla
**Solución:**
1. Verifica que estés usando `package-web.json` como `package.json`
2. Verifica variables de entorno en Vercel
3. Chequea los logs en Vercel dashboard

---

## ✅ Checklist Final

### Antes de subir a GitHub:
- [ ] `.gitignore` configurado correctamente
- [ ] No hay credenciales en el código
- [ ] README.md actualizado
- [ ] Probar que la app funciona localmente

### Antes de deploy en Vercel:
- [ ] Variables de entorno configuradas
- [ ] Build funciona localmente (`npm run build`)
- [ ] Credenciales de Supabase funcionando

### Antes de distribuir instaladores:
- [ ] Probar instaladores en sistemas limpios
- [ ] Actualizar número de versión
- [ ] Crear release notes
- [ ] Verificar que todos los assets están incluidos

---

## 📞 Recursos Útiles

- **Git:** https://git-scm.com/doc
- **GitHub:** https://docs.github.com
- **Vercel:** https://vercel.com/docs
- **Electron:** https://www.electronjs.org/docs
- **Electron Builder:** https://www.electron.build

---

## 🎓 Comandos de Referencia Rápida

```bash
# GIT BÁSICO
git status                    # Ver estado
git add .                     # Agregar todos los cambios
git commit -m "mensaje"       # Guardar cambios
git push                      # Subir a GitHub
git pull                      # Traer cambios de GitHub

# GIT AVANZADO
git log                       # Ver historial
git diff                      # Ver diferencias
git branch                    # Ver branches
git checkout -b nueva-rama    # Crear nueva rama

# VERSIONES
git tag v1.0.0                # Crear tag
git push origin v1.0.0        # Subir tag
git tag -l                    # Listar tags

# ELECTRON
npm run dev                   # Desarrollo
npm run build:win             # Build Windows
npm run build:mac             # Build macOS
npm run build:linux           # Build Linux
npm run build:all             # Build todas

# VERCEL
vercel                        # Deploy preview
vercel --prod                 # Deploy producción
vercel logs                   # Ver logs
vercel env ls                 # Listar variables de entorno
```

---

¡Listo! Ahora tienes todo lo necesario para convertir AURA en una app de escritorio y distribuirla. 🎉
