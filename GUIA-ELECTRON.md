# Guía Completa: Convertir AURA en App de Escritorio 💻

## 📋 Tabla de Contenidos

1. [Preparación del Entorno](#1-preparación-del-entorno)
2. [Configuración de Electron](#2-configuración-de-electron)
3. [Subir a GitHub](#3-subir-a-github)
4. [Deploy en Vercel (Web)](#4-deploy-en-vercel)
5. [Generar Instaladores](#5-generar-instaladores)
6. [Distribución](#6-distribución)

---

## 1. Preparación del Entorno

### Requisitos Previos
- Node.js 18+ instalado
- Git instalado
- Cuenta de GitHub
- Cuenta de Vercel (opcional, para versión web)

### Instalar Git (si no lo tienes)
```bash
# Windows: Descargar desde https://git-scm.com/download/win
# macOS:
brew install git

# Linux (Ubuntu/Debian):
sudo apt-get install git
```

---

## 2. Configuración de Electron

### Paso 1: Cambiar al package.json de Electron

```bash
# Guardar el package.json actual (para volver a la versión web si es necesario)
mv package.json package-web.json

# Activar el package.json de Electron
mv package-electron.json package.json
```

### Paso 2: Instalar dependencias de Electron

```bash
npm install
```

Esto instalará:
- `electron` - Framework de aplicación de escritorio
- `electron-builder` - Constructor de instaladores
- `concurrently` - Para correr múltiples procesos
- `wait-on` - Esperar a que Vite esté listo
- `cross-env` - Variables de entorno multiplataforma

### Paso 3: Probar en desarrollo

```bash
npm run dev
```

Esto abrirá:
1. Servidor Vite en http://localhost:5173
2. Ventana de Electron con la aplicación

---

## 3. Subir a GitHub

### Paso 1: Crear repositorio en GitHub

1. Ve a https://github.com
2. Click en "New repository" (botón verde)
3. Nombre: `aura-funeraria`
4. Descripción: "Sistema de Gestión Funeraria"
5. Privado o Público (tu elección)
6. **NO** marcar "Initialize with README" (ya tenemos README)
7. Click "Create repository"

### Paso 2: Inicializar Git localmente

```bash
# Inicializar repositorio Git
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "Initial commit: Sistema AURA completo"

# Conectar con GitHub (reemplaza TU-USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU-USUARIO/aura-funeraria.git

# Subir al repositorio
git branch -M main
git push -u origin main
```

### Paso 3: Verificar

1. Actualiza la página de tu repositorio en GitHub
2. Deberías ver todos los archivos subidos
3. El README.md se mostrará automáticamente

---

## 4. Deploy en Vercel (Versión Web)

### Opción A: Deploy Automático desde GitHub

1. **Ir a Vercel:**
   - Ve a https://vercel.com
   - Inicia sesión con tu cuenta de GitHub

2. **Importar Proyecto:**
   - Click en "Add New..." → "Project"
   - Selecciona tu repositorio `aura-funeraria`
   - Click "Import"

3. **Configurar Build:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Variables de Entorno:**
   - Click en "Environment Variables"
   - Agregar:
     ```
     VITE_SUPABASE_URL = tu_url_de_supabase
     VITE_SUPABASE_ANON_KEY = tu_key_anonima
     ```

5. **Deploy:**
   - Click "Deploy"
   - Espera 2-3 minutos
   - ¡Tu app estará en línea!

### Opción B: Deploy Manual con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Para producción
vercel --prod
```

### Configurar Deploy Continuo

Cada vez que hagas `git push` a GitHub, Vercel automáticamente:
1. Detectará el cambio
2. Construirá la aplicación
3. Desplegará la nueva versión

---

## 5. Generar Instaladores

### Para Windows (desde Windows, Linux o macOS)

```bash
# Generar instalador NSIS y Portable
npm run build:win
```

Genera:
- `release/AURA-Setup-1.0.0.exe` (Instalador)
- `release/AURA-1.0.0.exe` (Portable)

### Para macOS (solo desde macOS)

```bash
# Generar .dmg y .zip
npm run build:mac
```

Genera:
- `release/AURA-1.0.0.dmg` (Imagen de disco)
- `release/AURA-1.0.0-mac.zip` (Comprimido)

### Para Linux (desde cualquier plataforma)

```bash
# Generar AppImage, .deb y .rpm
npm run build:linux
```

Genera:
- `release/AURA-1.0.0.AppImage` (Universal)
- `release/AURA-1.0.0.deb` (Ubuntu/Debian)
- `release/AURA-1.0.0.rpm` (Fedora/RedHat)

### Para Todas las Plataformas

```bash
# Generar instaladores para Windows, macOS y Linux
npm run build:all
```

**Nota:** Para compilar para macOS necesitas estar en macOS.

---

## 6. Distribución

### Opción 1: GitHub Releases (Recomendado)

1. **Crear Release en GitHub:**
   ```bash
   # Crear tag
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Subir Instaladores:**
   - Ve a tu repositorio en GitHub
   - Click en "Releases" → "Create a new release"
   - Selecciona el tag `v1.0.0`
   - Título: "AURA v1.0.0 - Release Inicial"
   - Descripción: Lista de características
   - Arrastra los archivos de `release/` al área de assets
   - Click "Publish release"

3. **Los usuarios descargan:**
   - Desde la página de Releases
   - URL directa: `https://github.com/TU-USUARIO/aura-funeraria/releases`

### Opción 2: Sitio Web Propio

Sube los instaladores a tu servidor/hosting y proporciona links de descarga:

```html
<a href="/downloads/AURA-Setup-1.0.0.exe">Descargar para Windows</a>
<a href="/downloads/AURA-1.0.0.dmg">Descargar para macOS</a>
<a href="/downloads/AURA-1.0.0.AppImage">Descargar para Linux</a>
```

### Opción 3: Auto-Actualización

Para implementar actualizaciones automáticas, usar `electron-updater`:

```bash
npm install electron-updater
```

Configurar en `electron.js`:
```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

---

## 7. Workflow Completo de Desarrollo

### Para Versión Web (PWA)

```bash
# 1. Cambiar a package.json web
mv package.json package-electron.json
mv package-web.json package.json

# 2. Instalar dependencias
npm install

# 3. Desarrollo
npm run dev

# 4. Build
npm run build

# 5. Commit y push
git add .
git commit -m "Update: nueva funcionalidad"
git push

# 6. Vercel hace deploy automático ✨
```

### Para Versión Escritorio

```bash
# 1. Cambiar a package.json electron
mv package.json package-web.json
mv package-electron.json package.json

# 2. Instalar dependencias
npm install

# 3. Desarrollo
npm run dev

# 4. Build instaladores
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux

# 5. Subir a GitHub Releases
git tag v1.0.1
git push origin v1.0.1
# Luego subir instaladores manualmente a GitHub Releases
```

---

## 8. Checklist Final

### Antes de Distribuir

- [ ] Cambiar íconos en `public/icons/` con logo AURA real
- [ ] Actualizar información en `package.json` (autor, descripción)
- [ ] Probar instaladores en sistemas limpios
- [ ] Verificar firma de código (Windows/macOS)
- [ ] Actualizar `README.md` con información real
- [ ] Crear documentación de usuario
- [ ] Configurar auto-actualizaciones
- [ ] Hacer backup de la base de datos

### Seguridad

- [ ] No incluir credenciales en el código
- [ ] Usar variables de entorno
- [ ] Implementar encriptación para datos sensibles
- [ ] Configurar CSP (Content Security Policy)
- [ ] Verificar permisos de la app

---

## 9. Comandos de Referencia Rápida

```bash
# DESARROLLO
npm run dev              # Electron + Vite en desarrollo
npm run dev:vite         # Solo Vite
npm run dev:electron     # Solo Electron

# BUILD
npm run build            # Build Vite
npm run build:electron   # Build + instaladores (todos)
npm run build:win        # Solo Windows
npm run build:mac        # Solo macOS
npm run build:linux      # Solo Linux

# GIT
git status               # Ver cambios
git add .                # Agregar todos los cambios
git commit -m "mensaje"  # Guardar cambios
git push                 # Subir a GitHub
git tag v1.0.0           # Crear versión
git push origin v1.0.0   # Subir versión

# VERCEL
vercel                   # Deploy preview
vercel --prod            # Deploy producción
vercel logs              # Ver logs
```

---

## 10. Solución de Problemas

### Error: "Electron no abre"
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Error: "Build falla en Windows"
```bash
# Instalar dependencias nativas
npm install --global windows-build-tools
```

### Error: "No se pueden firmar los instaladores"
```bash
# Windows: Obtener certificado de firma de código
# macOS: Configurar certificado de Apple Developer
# Por ahora, puedes omitir la firma para pruebas
```

### Error al subir a GitHub
```bash
# Verificar remote
git remote -v

# Reconfigurar si es necesario
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/aura-funeraria.git
```

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Aplicación web en Vercel
- ✅ Código en GitHub
- ✅ Aplicación de escritorio para Windows, macOS y Linux
- ✅ Sistema de distribución configurado

**Próximos pasos sugeridos:**
1. Personalizar con logo e información real
2. Agregar certificado de firma de código
3. Configurar auto-actualizaciones
4. Crear landing page para descargas
5. Documentación de usuario completa

---

**¿Necesitas ayuda?** Consulta la documentación oficial:
- [Electron Docs](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Docs](https://docs.github.com)
