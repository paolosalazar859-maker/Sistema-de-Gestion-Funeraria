# 🔧 SOLUCIÓN: Error "Failed to load url /app/routes.ts"

## 🔴 ERROR

```
Pre-transform error: Failed to load url /app/routes.ts (resolved id: app/routes.ts) in app/App.tsx. 
Does the file exist?
```

## ✅ SOLUCIÓN

Este error es causado por **caché de Vite** que todavía recuerda el archivo antiguo `routes.ts`.

### **Paso 1: Detener el servidor de desarrollo**

Si `npm run dev` está ejecutándose:
```bash
# Presiona Ctrl+C en la terminal donde está corriendo
```

### **Paso 2: Limpiar caché de Vite y node_modules**

```bash
# Limpiar caché de Vite
rm -rf node_modules/.vite

# Limpiar dist (opcional pero recomendado)
rm -rf dist

# Limpiar caché de Electron (opcional)
rm -rf .electron-cache
```

### **Paso 3: Reiniciar el servidor**

```bash
npm run dev
```

---

## 🚀 SOLUCIÓN ALTERNATIVA: Compilar directamente

Si prefieres no usar modo desarrollo, compila e instala directamente:

```bash
# Opción 1: Script automático
chmod +x install.sh
./install.sh

# Opción 2: Manual
npm run build:mac
rm -rf /Applications/AURA.app
open release/AURA-1.0.0-mac.dmg
xattr -cr /Applications/AURA.app
open /Applications/AURA.app
```

---

## 📋 VERIFICACIÓN

### **Confirmar que el archivo correcto existe:**

```bash
ls -la src/app/routes.tsx
```

**Deberías ver:**
```
-rw-r--r--  1 user  staff  XXX  fecha  src/app/routes.tsx
```

### **Confirmar que NO existe el archivo antiguo:**

```bash
ls -la src/app/routes.ts
```

**Deberías ver:**
```
ls: src/app/routes.ts: No such file or directory
```

---

## 🔍 CAUSA DEL PROBLEMA

1. **Antes:** El archivo era `routes.ts`
2. **Cambio:** Renombramos a `routes.tsx` para soportar JSX
3. **Problema:** Vite tiene en caché la ruta antigua `routes.ts`
4. **Solución:** Limpiar caché y reiniciar

---

## ✅ CAMBIOS REALIZADOS

1. ✅ Importación explícita en `App.tsx`:
   ```typescript
   import { router } from "./routes.tsx";
   ```

2. ✅ Archivo `routes.tsx` existe y es correcto

3. ✅ Usa `react-router` (no `react-router-dom`)

---

## 🎯 COMANDOS RÁPIDOS

```bash
# Detener servidor (Ctrl+C)
# Luego ejecutar:

# Limpiar caché
rm -rf node_modules/.vite dist

# Reiniciar
npm run dev

# O compilar directamente
npm run build:mac
```

---

## 💡 SI EL ERROR PERSISTE

Si después de limpiar la caché el error continúa:

### **1. Reinstalar node_modules completo:**

```bash
rm -rf node_modules
npm install
npm run dev
```

### **2. Verificar que no hay archivos duplicados:**

```bash
find src -name "routes.*"
```

**Deberías ver SOLO:**
```
src/app/routes.tsx
```

Si ves `src/app/routes.ts`, elimínalo:
```bash
rm src/app/routes.ts
```

### **3. Reiniciar completamente:**

```bash
# Detener todo (Ctrl+C)
rm -rf node_modules/.vite dist node_modules
npm install
npm run dev
```

---

## ✅ ESTADO ESPERADO

Después de aplicar la solución:

- ✅ `src/app/routes.tsx` existe
- ✅ `src/app/routes.ts` NO existe
- ✅ Caché de Vite limpia
- ✅ `npm run dev` funciona sin errores
- ✅ Navegación con HashRouter operativa

---

**¡El error debería estar resuelto!** 🎉

© 2026 AURA - Sistema de Gestión Funeraria
