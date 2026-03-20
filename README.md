# 🏛️ AURA - Sistema de Gestión Funeraria

Sistema profesional de escritorio para gestión de servicios funerarios, desarrollado con **Electron + React + SQLite**.

---

## ✨ Características Principales

### 📋 Gestión de Servicios
- ✅ Registro completo de servicios funerarios
- ✅ Categorías personalizables (Servicio Funerario, Grabado, Otros)
- ✅ Formato de montos con separadores de miles (`xxx.xxx.xxx`)
- ✅ Gestión de cuotas e instalments
- ✅ Historial completo de pagos

### 💰 Control de Cobros
- ✅ Dashboard con estado de todos los servicios
- ✅ Filtros por estado (Pendiente, Al Día, Pagado)
- ✅ Registro de abonos
- ✅ Recibos imprimibles en PDF
- ✅ Exportación a Excel/CSV

### 📊 Análisis y Reportes
- ✅ Dashboard con gráficos interactivos
- ✅ Estadísticas de recaudación
- ✅ Análisis de servicios por tipo
- ✅ Indicadores de cobranza

### 💾 Backups Automáticos
- ✅ Backups programados (diario, semanal, mensual)
- ✅ Backups manuales con un clic
- ✅ Restauración desde backup
- ✅ Gestión de ubicación de backups

### 🔄 Actualizaciones Automáticas
- ✅ Verificación automática de actualizaciones
- ✅ Descarga e instalación con un clic
- ✅ Notificaciones de nuevas versiones
- ✅ Integración con GitHub Releases

### 👥 Control de Acceso
- ✅ Roles diferenciados (Administrador, Oficina)
- ✅ Permisos específicos por rol
- ✅ Perfiles personalizables

### 🎨 Interfaz Profesional
- ✅ Diseño sobrio y elegante
- ✅ Colores corporativos (gris oscuro, azul marino, dorado)
- ✅ Responsive y adaptable
- ✅ Iconografía profesional

---

## 🚀 Instalación Rápida

### **Opción 1: Script Automático (Recomendado)**

```bash
# 1. Dale permisos de ejecución al script
chmod +x install.sh

# 2. Ejecuta el instalador
./install.sh
```

El script hará automáticamente:
- ✅ Compilar la aplicación
- ✅ Desinstalar versión anterior
- ✅ Instalar nueva versión
- ✅ Configurar permisos
- ✅ Abrir AURA

---

### **Opción 2: Instalación Manual**

```bash
# 1. Compilar
npm run build:mac

# 2. Desinstalar anterior
rm -rf /Applications/AURA.app

# 3. Instalar nueva
open release/AURA-1.0.0-mac.dmg
# (Arrastra AURA.app a Aplicaciones)

# 4. Configurar permisos
xattr -cr /Applications/AURA.app

# 5. Abrir
open /Applications/AURA.app
```

Ver más detalles en: **[INSTALACION-RAPIDA.md](INSTALACION-RAPIDA.md)**

---

## 🔐 Credenciales Por Defecto

```
Usuario:    admin
Contraseña: admin123
```

**⚠️ IMPORTANTE:** Cambia la contraseña después del primer inicio desde **Perfil → Configuración**.

---

## 📁 Estructura del Proyecto

```
SistemaFuneraria/
├── src/app/                    # Código fuente React
│   ├── components/             # Componentes React
│   ├── context/                # Context providers
│   ├── data/                   # Lógica de datos
│   ├── hooks/                  # Custom hooks
│   ├── utils/                  # Utilidades
│   ├── App.tsx                 # Componente principal
│   └── routes.tsx              # Configuración de rutas
├── electron.js                 # Proceso principal de Electron
├── preload.js                  # Script de preload
├── database.js                 # Gestor de SQLite
├── backup-manager.js           # Sistema de backups
├── update-manager.js           # Sistema de actualizaciones
├── vite.config.ts              # Configuración de Vite
├── package.json                # Dependencias y scripts
├── install.sh                  # Script de instalación automática
├── INSTALACION-RAPIDA.md       # Guía de instalación detallada
└── GUIA-ACTUALIZACIONES.md     # Guía de actualizaciones
```

---

## 🛠️ Desarrollo

### **Iniciar en Modo Desarrollo**

```bash
# Instalar dependencias
npm install

# Iniciar Vite + Electron simultáneamente
npm run dev
```

Esto abrirá:
- 🌐 Vite dev server en `http://localhost:5173`
- 🖥️ Ventana de Electron con DevTools abiertos

### **Reconstruir Dependencias Nativas**

```bash
# Si hay problemas con better-sqlite3
npm run rebuild
```

---

## 📦 Compilación

### **macOS**

```bash
npm run build:mac
```

**Genera:**
- `release/AURA-1.0.0-mac.dmg` ← Instalador principal
- `release/AURA-1.0.0-mac.zip` ← Archivo comprimido

### **Windows**

```bash
npm run build:win
```

**Genera:**
- `release/AURA-Setup-1.0.0.exe` ← Instalador
- `release/AURA-1.0.0.exe` ← Portable

### **Linux**

```bash
npm run build:linux
```

**Genera:**
- `release/AURA-1.0.0.AppImage` ← AppImage
- `release/AURA-1.0.0.deb` ← Paquete Debian

---

## 🔄 Publicar Actualizaciones

### **1. Configurar GitHub Release**

```bash
# Crear token en GitHub
# Settings → Developer Settings → Personal Access Tokens → Generate new token
# Permisos: repo (todos)

# Agregar token al entorno
export GH_TOKEN="tu_token_aqui"
```

### **2. Incrementar Versión**

Edita `package.json`:

```json
{
  "version": "1.1.0"  // Cambiar a la nueva versión
}
```

### **3. Publicar**

```bash
# macOS
npm run publish:mac

# Windows
npm run publish:win

# Linux
npm run publish:linux
```

Ver más detalles en: **[GUIA-ACTUALIZACIONES.md](GUIA-ACTUALIZACIONES.md)**

---

## 📂 Ubicaciones de Datos

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

### **Configuración**
```
~/Library/Preferences/com.aura.funeraria.plist
```

---

## 🐛 Solución de Problemas

### **Error: "AURA no se puede abrir"**

```bash
xattr -cr /Applications/AURA.app
open /Applications/AURA.app
```

### **Error: Base de datos SQLite no disponible**

```bash
npm run rebuild
```

### **Error 404 o pantalla en blanco**

✅ **Ya corregido con HashRouter**

Si persiste:
```bash
rm -rf ~/Library/Application\ Support/AURA
open /Applications/AURA.app
```

### **Ver logs en tiempo real**

```bash
tail -f ~/Library/Logs/AURA/main.log
```

---

## 🧰 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar frontend (Vite) |
| `npm run build:mac` | Compilar app macOS (DMG) |
| `npm run build:win` | Compilar app Windows (EXE) |
| `npm run build:linux` | Compilar app Linux (AppImage/DEB) |
| `npm run publish:mac` | Publicar actualización macOS |
| `npm run publish:win` | Publicar actualización Windows |
| `npm run publish:linux` | Publicar actualización Linux |
| `npm run rebuild` | Reconstruir dependencias nativas |
| `npm run electron` | Ejecutar Electron solo |
| `npm run vite` | Ejecutar Vite solo |

---

## 📚 Tecnologías

### **Frontend**
- ⚛️ React 18.3
- 🎨 Tailwind CSS 4.1
- 🧭 React Router 7.13
- 📊 Recharts 2.15
- 🎭 Lucide React (iconos)
- 🎨 Material UI 7.3
- 🔔 Sonner (notificaciones)

### **Backend**
- 🖥️ Electron 34.0
- 💾 better-sqlite3 11.8
- 📦 electron-builder 25.1
- 🔄 electron-updater 6.3

### **Desarrollo**
- ⚡ Vite 6.3
- 🔧 TypeScript
- 📦 NPM

---

## 📄 Licencia

© 2026 AURA - Sistema de Gestión Funeraria

---

## 🆘 Soporte

Para problemas o consultas:

1. **Revisa la documentación:**
   - [INSTALACION-RAPIDA.md](INSTALACION-RAPIDA.md)
   - [GUIA-ACTUALIZACIONES.md](GUIA-ACTUALIZACIONES.md)

2. **Verifica los logs:**
   ```bash
   tail -f ~/Library/Logs/AURA/main.log
   ```

3. **Reconstruye las dependencias:**
   ```bash
   npm run rebuild
   ```

---

## 🎯 Roadmap

- [ ] Reportes personalizables
- [ ] Exportación a PDF
- [ ] Integración con impresoras térmicas
- [ ] Sistema de notificaciones por email
- [ ] Dashboard multi-usuario en tiempo real
- [ ] Aplicación móvil (React Native)

---

**¡Gracias por usar AURA!** 🏛️✨