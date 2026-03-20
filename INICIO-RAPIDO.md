# 🚀 AURA - Guía Rápida de Inicio

## 📦 ¿Qué tienes ahora?

Tu aplicación AURA ahora puede funcionar en **3 formas diferentes**:

1. **🌐 Web (PWA)** - En navegador, instalable, con modo offline
2. **💻 Escritorio** - App nativa para Windows, macOS y Linux
3. **☁️ Cloud** - Desplegada en Vercel con deploy continuo

---

## 🎯 Inicio Rápido (5 minutos)

### Paso 1: Elige tu versión

**Para desarrollo WEB:**
```bash
# Windows
switch-version.bat
# Elegir: 1

# macOS/Linux  
bash switch-version.sh
# Elegir: 1

npm install
npm run dev
```

**Para desarrollo ESCRITORIO:**
```bash
# Windows
switch-version.bat
# Elegir: 2

# macOS/Linux
bash switch-version.sh
# Elegir: 2

npm install
npm run dev
```

### Paso 2: Subir a GitHub

```bash
# Primera vez
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU-USUARIO/aura-funeraria.git
git push -u origin main

# Siguientes veces
git add .
git commit -m "Descripción de cambios"
git push
```

### Paso 3: Deploy en Vercel

1. Ve a https://vercel.com
2. Click "Import Project"
3. Selecciona tu repo de GitHub
4. Agrega variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

**¡Listo! Tu app está en línea** 🎉

---

## 📁 Archivos Importantes Creados

| Archivo | Descripción |
|---------|-------------|
| `electron.js` | Main process de Electron |
| `preload.js` | Bridge seguro entre main y renderer |
| `package-electron.json` | Dependencias para versión escritorio |
| `switch-version.bat/.sh` | Scripts para cambiar de versión |
| `vercel.json` | Configuración de Vercel |
| `.gitignore` | Archivos a ignorar en Git |
| `LICENSE.md` | Licencia del proyecto |
| `README.md` | Documentación principal |
| `GUIA-ELECTRON.md` | Guía completa de Electron |
| `GUIA-GITHUB-VERCEL.md` | Guía paso a paso Git/Vercel |

---

## 🔄 Workflow Diario

### Desarrollando WEB:
```bash
1. Cambiar a versión web: switch-version.bat → opción 1
2. npm install
3. npm run dev
4. Hacer cambios...
5. git add .
6. git commit -m "Cambios realizados"
7. git push
8. Vercel hace deploy automático ✨
```

### Desarrollando ESCRITORIO:
```bash
1. Cambiar a versión electron: switch-version.bat → opción 2
2. npm install
3. npm run dev
4. Hacer cambios...
5. npm run build:win  (Windows)
6. npm run build:mac  (macOS)
7. npm run build:linux (Linux)
8. Subir instaladores a GitHub Releases
```

---

## 🎨 Comandos Esenciales

### Desarrollo
```bash
npm run dev              # Iniciar en desarrollo
npm run build            # Build de producción
npm run preview          # Vista previa del build
```

### Electron
```bash
npm run build:win        # Instalador Windows
npm run build:mac        # Instalador macOS
npm run build:linux      # Instalador Linux
npm run build:all        # Todos los instaladores
```

### Git
```bash
git status               # Ver cambios
git add .                # Agregar cambios
git commit -m "mensaje"  # Guardar cambios
git push                 # Subir a GitHub
git tag v1.0.0           # Crear versión
git push origin v1.0.0   # Subir versión
```

### Vercel
```bash
vercel                   # Deploy preview
vercel --prod            # Deploy producción
vercel logs              # Ver logs
```

---

## 📊 Estructura del Proyecto

```
aura-funeraria/
├── src/                    # Código fuente
│   ├── app/
│   │   ├── components/    # Componentes React
│   │   ├── context/       # Context providers
│   │   ├── data/          # Lógica de datos
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilidades
│   │   ├── App.tsx        # App principal
│   │   ├── Root.tsx       # Root con providers
│   │   └── routes.ts      # Configuración rutas
│   └── styles/            # CSS global
│
├── public/                 # Assets públicos
│   ├── icons/             # Iconos PWA/Electron
│   └── manifest.json      # PWA Manifest
│
├── supabase/              # Backend
│   └── functions/
│       └── server/        # Edge Functions
│
├── release/               # Instaladores generados
│
├── electron.js            # Electron main
├── preload.js            # Electron preload
├── package.json          # Dependencias activas
├── package-web.json      # Deps versión web
├── package-electron.json # Deps versión electron
├── vercel.json           # Config Vercel
├── vite.config.ts        # Config Vite
└── README.md             # Documentación
```

---

## 🎯 Próximos Pasos Sugeridos

### Corto plazo:
- [ ] Personalizar íconos con logo real de AURA
- [ ] Configurar dominio personalizado en Vercel
- [ ] Probar instaladores en diferentes sistemas
- [ ] Crear documentación de usuario

### Mediano plazo:
- [ ] Configurar certificados de firma de código
- [ ] Implementar sistema de auto-actualizaciones
- [ ] Crear landing page de descargas
- [ ] Agregar analytics

### Largo plazo:
- [ ] Sistema de inventario completo
- [ ] Integración con impresoras térmicas
- [ ] App móvil (React Native)
- [ ] Multi-sucursal

---

## 📚 Documentación Completa

- **GUIA-ELECTRON.md** - Todo sobre Electron y generación de instaladores
- **GUIA-GITHUB-VERCEL.md** - Paso a paso Git, GitHub y Vercel
- **README.md** - Información general del proyecto

---

## 🆘 ¿Necesitas Ayuda?

### Problemas comunes:

**Git no reconocido:**
```bash
# Instalar desde: https://git-scm.com
```

**Error al hacer push:**
```bash
git pull origin main --rebase
git push
```

**Electron no abre:**
```bash
rm -rf node_modules
npm install
npm run dev
```

**Build falla:**
```bash
# Limpiar cache
npm run build -- --force
```

---

## ✅ Checklist de Producción

### Antes de distribuir:
- [ ] Cambiar íconos por logo real
- [ ] Actualizar información de contacto
- [ ] Probar en sistemas limpios
- [ ] Verificar credenciales no están en código
- [ ] Crear backup de base de datos
- [ ] Documentación de usuario completa
- [ ] Configurar sistema de respaldo

---

## 🎉 ¡Tu App Está Lista!

Ahora tienes un **sistema profesional completo** que puede:

✅ Ejecutarse en navegador (PWA)
✅ Instalarse como app de escritorio
✅ Funcionar sin internet (modo offline)
✅ Desplegarse automáticamente con Git
✅ Generar instaladores profesionales
✅ Escalar a producción

**¡Comienza a construir el futuro de AURA!** 🚀⚱️

---

## 📞 Enlaces Útiles

- **Documentación Electron:** https://www.electronjs.org/docs
- **Documentación Vercel:** https://vercel.com/docs
- **Guía de Git:** https://git-scm.com/doc
- **GitHub Docs:** https://docs.github.com
- **Supabase Docs:** https://supabase.com/docs

---

**AURA - Sistema de Gestión Funeraria** © 2026
