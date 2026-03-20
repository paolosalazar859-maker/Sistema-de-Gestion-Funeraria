# 🗄️ Guía de Integración SQLite para AURA

## 📋 Resumen

Esta guía te ayudará a integrar SQLite en la aplicación de escritorio AURA para reemplazar localStorage con una base de datos robusta y eficiente.

---

## ✅ ¿Qué se ha implementado?

### 1. **Módulo de Base de Datos** (`/database.js`)
- ✅ Creación y gestión de base de datos SQLite
- ✅ Esquema completo de tablas (servicios, pagos, usuarios, configuración)
- ✅ Operaciones CRUD completas
- ✅ Sistema de backup y restauración
- ✅ Migración automática desde localStorage

### 2. **APIs de Electron** (actualizado)
- ✅ `preload.js` - APIs seguras expuestas al renderer
- ✅ `electron.js` - Handlers IPC para todas las operaciones de BD
- ✅ Menús integrados para backup/restauración

### 3. **Integración en el Frontend**
- ✅ `serviceStore.ts` - Detección automática y uso de SQLite cuando está disponible
- ✅ `DatabaseManager.tsx` - Componente UI para gestión de BD
- ✅ `AdminProfile.tsx` - Tab de base de datos integrado
- ✅ Tipos TypeScript para APIs de Electron

---

## 🚀 Instalación

### Paso 1: Instalar better-sqlite3

En la carpeta del proyecto, ejecuta:

```bash
npm install better-sqlite3 --save
```

**Importante**: Si usas `package-electron.json`, edita ese archivo y agrega la dependencia manualmente:

```json
{
  "dependencies": {
    "better-sqlite3": "^11.0.0",
    // ... otras dependencias
  }
}
```

Luego ejecuta:

```bash
npm install
```

### Paso 2: Verificar la instalación

Reinicia la aplicación de Electron:

```bash
npm run dev
# o si usas el package-electron.json:
# npm run dev (desde la versión Electron)
```

En la consola deberías ver:

```
✅ Módulo de base de datos cargado
📁 Inicializando base de datos en: [ruta]
✅ Tablas creadas correctamente
✅ Base de datos SQLite lista
```

---

## 📂 Ubicación de la Base de Datos

La base de datos se crea automáticamente en:

- **Windows**: `C:\Users\[Usuario]\AppData\Roaming\aura-funeraria\aura-database.db`
- **macOS**: `~/Library/Application Support/aura-funeraria/aura-database.db`
- **Linux**: `~/.config/aura-funeraria/aura-database.db`

---

## 🔄 Migración de Datos

### Automática (Recomendado)

1. Inicia sesión como **Administrador**
2. Ve a **Perfil → Base de datos**
3. Verás un botón **"Migrar a SQLite"**
4. Clic en el botón y espera a que complete

Los datos de localStorage se copiarán automáticamente a SQLite.

### Manual (Programática)

En tu código, puedes llamar:

```typescript
import { migrateToSQLite } from './data/serviceStore';

// En algún useEffect o función de inicio
migrateToSQLite().then(success => {
  if (success) {
    console.log('✅ Migración exitosa');
  }
});
```

---

## 💾 Backup y Restauración

### Desde el Menú

1. **Crear Backup**:
   - `AURA → Crear Backup`
   - Elige ubicación y nombre
   - El archivo `.db` se guarda

2. **Restaurar Backup**:
   - `AURA → Restaurar Backup`
   - Selecciona el archivo `.db`
   - Confirma la restauración
   - La app se recarga automáticamente

### Desde el Panel de Administrador

1. Ve a **Perfil → Base de datos**
2. Usa los botones "Crear Backup" o "Restaurar Backup"

---

## 🏗️ Estructura de la Base de Datos

### Tabla: `services`

Almacena todos los servicios funerarios:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | ID del servicio (SRV-001, SRV-002, ...) |
| `service_category` | TEXT | Categoría del servicio |
| `deceased_name` | TEXT | Nombre del fallecido |
| `contractor_name` | TEXT | Nombre del contratante |
| `total_service` | REAL | Monto total del servicio |
| `total_paid` | REAL | Total pagado |
| `pending_balance` | REAL | Saldo pendiente |
| `status` | TEXT | Estado: "Pagado", "Abonando", "Deuda Total" |
| ... | ... | (más de 30 campos) |

### Tabla: `payments`

Almacena todos los abonos/pagos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | ID del pago |
| `service_id` | TEXT | FK a `services` |
| `date` | TEXT | Fecha del pago |
| `amount` | REAL | Monto |
| `method` | TEXT | Método de pago |
| `balance` | REAL | Saldo después del pago |

### Tabla: `users` (futura)

Para sistema de autenticación local (próximamente).

### Tabla: `config`

Para configuraciones de la aplicación.

---

## 🔍 Verificar el Estado

### En el Panel de Administrador

Ve a **Perfil → Base de datos** para ver:

- ✅ Estado de SQLite (Disponible / No disponible)
- 📊 Cantidad de servicios
- 📊 Cantidad de pagos
- 💾 Tamaño de la base de datos
- 📁 Ubicación del archivo

### En la Consola de Desarrollo

Abre DevTools (F12) y verás logs como:

```
✅ Servicios cargados desde SQLite: 25
✅ Servicio SRV-025 guardado en SQLite
```

---

## ⚙️ Comportamiento del Sistema

### Modo Híbrido

El sistema funciona en modo híbrido:

1. **En Electron con SQLite**:
   - Lee desde SQLite
   - Escribe en SQLite
   - Caché en localStorage (opcional)

2. **En Electron sin SQLite**:
   - Fallback automático a localStorage
   - Mensaje de advertencia en el panel

3. **En Web (no Electron)**:
   - Usa localStorage + Supabase como antes
   - Sin cambios

### Detección Automática

El código detecta automáticamente si:
- Está corriendo en Electron
- SQLite está disponible
- Debe usar SQLite o localStorage

```typescript
// Ejemplo interno
const isElectronWithDB = () => {
  return window.electronAPI?.isElectron && 
         window.electronAPI?.db;
};
```

---

## 🛠️ Solución de Problemas

### ❌ "Base de datos SQLite no disponible"

**Causa**: `better-sqlite3` no está instalado.

**Solución**:
```bash
npm install better-sqlite3
```

Luego reinicia la aplicación.

---

### ❌ Error al migrar datos

**Causa**: Base de datos corrupta o permisos insuficientes.

**Solución**:
1. Cierra la aplicación
2. Ve a la carpeta de datos:
   - Windows: `%APPDATA%\aura-funeraria`
   - macOS: `~/Library/Application Support/aura-funeraria`
3. Elimina `aura-database.db`
4. Reinicia y vuelve a migrar

---

### ❌ Error "Cannot find module 'better-sqlite3'"

**Causa**: La dependencia no está en `node_modules`.

**Solución**:
```bash
# Limpiar y reinstalar
rm -rf node_modules
npm install
```

---

### ❌ La app no guarda en SQLite

**Verifica**:
1. Que `better-sqlite3` esté instalado
2. En la consola: `✅ Base de datos SQLite lista`
3. En el panel de admin: Estado = "Disponible"

---

## 📊 Ventajas de SQLite

### ✅ Rendimiento
- **10x más rápido** que localStorage
- Consultas instantáneas con índices
- Sin límites de almacenamiento (vs 5-10MB de localStorage)

### ✅ Confiabilidad
- Transacciones ACID
- Sin pérdida de datos en crashes
- Backups simples (copiar archivo)

### ✅ Funcionalidad
- Consultas SQL complejas
- Relaciones entre tablas (Foreign Keys)
- Agregaciones y estadísticas eficientes

### ✅ Escalabilidad
- Soporta millones de registros
- Archivos de varios GB sin problemas
- Índices automáticos

---

## 🎯 Próximos Pasos

Ahora que SQLite está integrado, puedes:

1. ✅ **Migrar tus datos actuales**
2. ✅ **Crear backups regulares**
3. 🔜 **Implementar búsqueda avanzada** (usa SQL)
4. 🔜 **Reportes complejos** (agregaciones SQL)
5. 🔜 **Autenticación local** (tabla `users`)
6. 🔜 **Historial de cambios** (tabla de auditoría)

---

## 📝 Notas Importantes

### ⚠️ Compatibilidad

- **Electron**: ✅ Compatible (recomendado)
- **Web**: ⚠️ SQLite NO funciona en navegador (usa localStorage + Supabase)
- **Node.js**: ✅ Compatible

### ⚠️ Seguridad

- La base de datos NO está encriptada por defecto
- Para encriptar: considera `sqlcipher` (extensión)
- Los backups son archivos `.db` planos

### ⚠️ Backups

- **Recomendación**: Backup diario automático
- **Implementación futura**: Scheduled backups
- **Ubicación sugerida**: Carpeta de Documentos del usuario

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa la consola de Electron (F12)
2. Verifica los logs en la terminal
3. Consulta esta guía
4. Revisa el código en `/database.js`

---

## ✨ ¡Listo!

Tu aplicación AURA ahora tiene una base de datos SQLite profesional y robusta. 

**¡Disfruta de la velocidad y confiabilidad de SQLite!** 🚀

---

**Versión**: 1.0.0  
**Fecha**: Marzo 2026  
**Sistema**: AURA - Sistema de Gestión Funeraria
