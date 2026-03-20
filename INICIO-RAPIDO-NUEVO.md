# 🚀 GUÍA DE INICIO RÁPIDO - AURA v1.0

---

## ✅ **PASO 1: Instalar Dependencias**

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

⏱️ **Tiempo estimado:** 2-3 minutos

---

## ✅ **PASO 2: Recompilar better-sqlite3**

```bash
npx electron-rebuild -f -w better-sqlite3
```

⏱️ **Tiempo estimado:** 1-2 minutos

**Nota:** Si recibes un error, primero ejecuta:
```bash
npm install --save-dev electron-rebuild
```

---

## ✅ **PASO 3: Ejecutar la Aplicación**

### **Opción A: Modo Simple (Recomendado)**

```bash
npm run dev
```

Esto iniciará:
- ✅ Servidor de desarrollo Vite (frontend)
- ✅ Aplicación Electron (desktop)

### **Opción B: Modo Manual (Dos Terminales)**

**Terminal 1:**
```bash
npm run vite
```

**Terminal 2 (espera a que Vite esté listo):**
```bash
npm run electron
```

---

## 🎯 **¿QUÉ DEBERÍAS VER?**

### **En la Consola:**

```
✅ Módulo de base de datos cargado
📁 Inicializando base de datos en: /Users/.../aura-database.db
✅ Tablas creadas correctamente
✅ Base de datos SQLite lista
✅ Sistema de backups automáticos inicializado
✅ Sistema de actualizaciones automáticas inicializado
🌐 Cargando desde: http://localhost:5173
```

### **En la Ventana de Electron:**

- 🔐 Pantalla de Login de AURA
- 🎨 Diseño elegante con colores azul marino y dorado

---

## 🔐 **ACCESO A LA APLICACIÓN**

### **Usuario Administrador (predeterminado):**
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### **Usuario Oficina (predeterminado):**
- **Usuario:** `oficina`
- **Contraseña:** `oficina123`

**⚠️ IMPORTANTE:** Cambia estas contraseñas en la primera sesión.

---

## 📍 **UBICACIÓN DE ARCHIVOS**

### **Base de Datos:**
```
macOS: ~/Library/Application Support/Electron/aura-database.db
Windows: %APPDATA%\Electron\aura-database.db
Linux: ~/.config/Electron/aura-database.db
```

### **Backups:**
```
macOS: ~/Documents/AURA-Backups/
Windows: %USERPROFILE%\Documents\AURA-Backups\
Linux: ~/Documents/AURA-Backups/
```

---

## 🎛️ **CARACTERÍSTICAS PRINCIPALES**

### **1. Sistema de Actualizaciones**
- Ve a: **Perfil → Actualizaciones**
- Funciones:
  - ✅ Verificar actualizaciones manualmente
  - ✅ Descargar e instalar automáticamente
  - ✅ Ver versión actual
  - ✅ Configurar actualizaciones automáticas

### **2. Sistema de Backups**
- Ve a: **Perfil → Base de datos**
- Funciones:
  - ✅ Crear backup manual
  - ✅ Programar backups automáticos
  - ✅ Restaurar desde backup
  - ✅ Abrir carpeta de backups

### **3. Módulos de Gestión**
- ✅ **Dashboard:** Resumen y gráficos
- ✅ **Registro de Servicios:** Crear nuevos servicios
- ✅ **Estado de Cobros:** Ver pagos y cuotas
- ✅ **Clientes:** (Si está habilitado)

---

## 🛠️ **SOLUCIÓN DE PROBLEMAS**

### **Error: "Cannot find module 'better-sqlite3'"**
```bash
npm install better-sqlite3
npx electron-rebuild -f -w better-sqlite3
```

### **Error: "NODE_MODULE_VERSION mismatch"**
```bash
npx electron-rebuild -f -w better-sqlite3
```

### **La ventana de Electron no se abre**
1. Verifica que Vite esté corriendo en http://localhost:5173
2. Revisa la consola en busca de errores
3. Intenta cerrar todos los procesos y ejecuta de nuevo

### **"Cannot read properties of undefined (reading 'isElectron')"**
- Esto es normal en el navegador web
- La aplicación está diseñada para ejecutarse en Electron

---

## 📦 **COMPILAR PARA DISTRIBUCIÓN**

### **macOS:**
```bash
npm run build:mac
```

### **Windows:**
```bash
npm run build:win
```

### **Linux:**
```bash
npm run build:linux
```

Los instaladores se generarán en la carpeta `dist-electron/`.

---

## 📚 **DOCUMENTACIÓN ADICIONAL**

- **GUIA-ACTUALIZACIONES.md** - Sistema de actualizaciones automáticas
- **GUIA-SQLITE.md** - Base de datos y migraciones
- **GUIA-ELECTRON.md** - Desarrollo con Electron
- **GUIA-GITHUB-VERCEL.md** - Despliegue y publicación

---

## 🆘 **¿NECESITAS AYUDA?**

Si encuentras algún error:

1. ✅ Revisa la consola de Electron (Cmd+Option+I en macOS)
2. ✅ Revisa los logs de la terminal
3. ✅ Consulta la documentación en los archivos GUIA-*.md
4. ✅ Verifica que todas las dependencias estén instaladas

---

## ✨ **¡LISTO!**

Tu sistema AURA está configurado y listo para usar. 

**Próximos pasos sugeridos:**

1. Cambiar las contraseñas predeterminadas
2. Configurar backups automáticos
3. Revisar la configuración de actualizaciones
4. Crear tu primer servicio de prueba

---

**Versión:** 1.0.0  
**Última actualización:** Marzo 2026
