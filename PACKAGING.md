# 📦 GUÍA COMPLETA DE EMPAQUETADO - AURA

Esta guía te ayudará a crear instaladores profesionales de la aplicación AURA para distribución.

---

## 🎯 PASO 1: PREPARAR EL ENTORNO

### **1.1 Verificar Instalación**
```bash
# Verificar Node.js (debe ser 18+)
node --version

# Verificar npm
npm --version
```

### **1.2 Instalar Dependencias**
```bash
# Instalar todas las dependencias
npm install

# Recompilar better-sqlite3 para Electron
npx electron-rebuild -f -w better-sqlite3
```

### **1.3 Probar en Desarrollo**
```bash
# Ejecutar en modo desarrollo
npm run dev

# Verificar que todo funciona correctamente:
# ✓ La aplicación abre correctamente
# ✓ Los datos se guardan en SQLite
# ✓ Las funcionalidades principales funcionan
```

---

## 🛠️ PASO 2: COMPILAR LA APLICACIÓN

### **2.1 Build de Producción**
```bash
# Compilar la aplicación React con Vite
npm run build
```

Esto creará la carpeta **`dist/`** con los archivos optimizados del frontend.

### **2.2 Verificar el Build**
```bash
# Verificar que se creó la carpeta dist/
ls dist/

# Debería mostrar:
# - index.html
# - assets/
# - icons/
```

---

## 📦 PASO 3: CREAR INSTALADORES

### **Opción A: Compilar para Tu Sistema Operativo Actual**

```bash
# Esto detectará automáticamente tu SO y creará el instalador apropiado
npm run build:electron
```

### **Opción B: Compilar para un Sistema Específico**

#### **🍎 Para macOS**
```bash
npm run build:mac
```
**Genera:**
- `AURA Funeraria-0.0.1.dmg` - Instalador DMG
- `AURA Funeraria-0.0.1-mac.zip` - Archivo ZIP

**Requisitos:**
- Solo se puede compilar en macOS (para firma de código)

---

#### **🪟 Para Windows**
```bash
npm run build:win
```
**Genera:**
- `AURA Funeraria Setup 0.0.1.exe` - Instalador NSIS
- `AURA Funeraria 0.0.1.exe` - Versión portable

**Compilación cruzada:**
- Se puede compilar desde macOS o Linux (requiere `wine`)

---

#### **🐧 Para Linux**
```bash
npm run build:linux
```
**Genera:**
- `AURA Funeraria-0.0.1.AppImage` - AppImage universal
- `aura-funeraria_0.0.1_amd64.deb` - Paquete Debian/Ubuntu

**Compilación cruzada:**
- Se puede compilar desde cualquier SO

---

## 📂 PASO 4: UBICACIÓN DE LOS INSTALADORES

Todos los instaladores se crean en la carpeta:
```
dist-electron/
```

### **Estructura de Salida**
```
dist-electron/
├── mac/
│   ├── AURA Funeraria.app/
│   └── AURA Funeraria-0.0.1.dmg
├── win-unpacked/
│   └── AURA Funeraria.exe
├── AURA Funeraria Setup 0.0.1.exe
└── linux-unpacked/
    └── aura-funeraria
```

---

## ✅ PASO 5: PROBAR LOS INSTALADORES

### **5.1 macOS (.dmg)**
1. Abrir el archivo `.dmg`
2. Arrastrar "AURA Funeraria" a la carpeta "Aplicaciones"
3. Abrir desde Aplicaciones
4. Si aparece "aplicación no verificada":
   - Click derecho → Abrir
   - Confirmar apertura

### **5.2 Windows (.exe)**
1. Ejecutar el instalador `.exe`
2. Seguir el asistente de instalación
3. La app se instalará en `C:\Program Files\AURA Funeraria\`
4. Se creará un acceso directo en el escritorio

### **5.3 Linux (.AppImage)**
```bash
# Dar permisos de ejecución
chmod +x AURA\ Funeraria-0.0.1.AppImage

# Ejecutar
./AURA\ Funeraria-0.0.1.AppImage
```

### **5.4 Linux (.deb)**
```bash
# Instalar
sudo dpkg -i aura-funeraria_0.0.1_amd64.deb

# Ejecutar
aura-funeraria
```

---

## 🔧 PASO 6: PERSONALIZACIÓN AVANZADA

### **6.1 Cambiar Versión**
Editar `package.json`:
```json
{
  "version": "1.0.0"
}
```

### **6.2 Cambiar Nombre del Producto**
Editar `electron-builder.json`:
```json
{
  "productName": "AURA Funeraria 2024"
}
```

### **6.3 Cambiar Icono**
- **macOS:** Reemplazar `/public/icons/icon-512x512.png` con un archivo `.icns`
- **Windows:** Reemplazar con un archivo `.ico`
- **Linux:** Usar `.png` de 512x512

### **6.4 Firma de Código (Producción)**

#### **macOS**
```json
{
  "mac": {
    "identity": "Developer ID Application: Tu Nombre (TEAM_ID)",
    "provisioningProfile": "path/to/profile.provisionprofile"
  }
}
```

#### **Windows**
```json
{
  "win": {
    "certificateFile": "path/to/certificate.p12",
    "certificatePassword": "your-password"
  }
}
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### **Error: "better-sqlite3 no se puede cargar"**
```bash
# Solución: Recompilar para Electron
npx electron-rebuild -f -w better-sqlite3
```

### **Error: "electron-builder no encontrado"**
```bash
# Solución: Reinstalar
npm install --save-dev electron-builder
```

### **Error: "Insufficient permissions" (macOS)**
```bash
# Solución: Desactivar Gatekeeper temporalmente
sudo spctl --master-disable
# Después de probar, reactivar:
sudo spctl --master-enable
```

### **Error: "La aplicación está dañada" (macOS)**
```bash
# Solución: Eliminar atributos de cuarentena
xattr -cr "/Applications/AURA Funeraria.app"
```

### **Instalador muy grande**
El tamaño típico es:
- **macOS:** 150-200 MB
- **Windows:** 120-180 MB
- **Linux:** 130-190 MB

Esto es normal porque incluye:
- Electron runtime (~100 MB)
- Node.js
- Chromium
- Tu aplicación y dependencias

---

## 📊 CHECKLIST DE DISTRIBUCIÓN

Antes de distribuir, verifica:

- [ ] ✅ La versión en `package.json` es correcta
- [ ] ✅ Todos los bugs conocidos están resueltos
- [ ] ✅ La aplicación funciona en modo desarrollo
- [ ] ✅ El build de producción funciona
- [ ] ✅ Los instaladores se generan sin errores
- [ ] ✅ Los instaladores se prueban en el SO objetivo
- [ ] ✅ La base de datos SQLite funciona correctamente
- [ ] ✅ Los backups automáticos funcionan
- [ ] ✅ Todas las funcionalidades principales probadas
- [ ] ✅ Los íconos se ven correctamente
- [ ] ✅ El nombre y la versión son correctos en "Acerca de"

---

## 🎉 ¡LISTO PARA DISTRIBUIR!

Una vez verificado todo:

1. **Comprimir** los instaladores
2. **Subir** a tu servidor / repositorio
3. **Compartir** con los usuarios finales

---

## 📞 SOPORTE

Si encuentras problemas durante el empaquetado:
1. Revisa los logs en la terminal
2. Verifica que todas las dependencias estén instaladas
3. Consulta la documentación de electron-builder
4. Contacta al equipo de desarrollo

---

**¡Éxito con la distribución de AURA! 🚀**
