# 🔧 Guía de Sequelize Sync - Onconor Clinic Manager

## ⚡ Configuración Rápida

### Variables de Entorno (`.env`)
```bash
# Configuración actual (RECOMENDADA para desarrollo)
SEQUELIZE_FORCE_SYNC=false
SEQUELIZE_ALTER_SYNC=false
SEQUELIZE_AUTO_SYNC=true
```

### Modos de Sincronización

| Modo | FORCE | ALTER | Descripción | Cuándo usar |
|------|-------|-------|-------------|-------------|
| **SAFE** ✅ | false | false | No modifica tablas existentes | Desarrollo normal |
| **ALTER** ⚠️ | false | true | Modifica estructura de tablas | Cambios en modelos |
| **RESET** 🔥 | true | false | Elimina y recrea TODAS las tablas | Empezar desde cero |

---

## 🚀 Uso Rápido

### Desde línea de comandos:
```bash
# Verificar configuración actual
node src/utils/sequelize-sync.js check

# Sincronización segura
node src/utils/sequelize-sync.js safe

# Modificar estructura (cuando cambies modelos)
node src/utils/sequelize-sync.js alter

# Reset completo (¡ELIMINA TODOS LOS DATOS!)
node src/utils/sequelize-sync.js reset

# Reset + seeders (para desarrollo rápido)
node src/utils/sequelize-sync.js quick --seeders
```

### Desde código JavaScript:
```javascript
const { syncWithMode, checkSyncConfig } = require('./src/utils/sequelize-sync');

// Verificar configuración
checkSyncConfig();

// Sincronización segura
await syncWithMode('SAFE');

// Sincronización con alter
await syncWithMode('ALTER');

// Reset completo (¡cuidado!)
await syncWithMode('RESET');
```

---

## 📋 Escenarios Comunes

### 🟢 **Desarrollo Normal**
```bash
# En .env
SEQUELIZE_FORCE_SYNC=false
SEQUELIZE_ALTER_SYNC=false
SEQUELIZE_AUTO_SYNC=true
```
- ✅ Las tablas se crean automáticamente si no existen
- ✅ Los datos existentes se mantienen
- ✅ Seguro para trabajo diario

### 🟡 **Cambios en Modelos**
```bash
# En .env
SEQUELIZE_FORCE_SYNC=false
SEQUELIZE_ALTER_SYNC=true
SEQUELIZE_AUTO_SYNC=true
```
- ⚠️ Modifica la estructura de tablas existentes
- ⚠️ Puede fallar si hay conflictos de datos
- 💡 Usar cuando agregues/modifiques campos en modelos

### 🔴 **Reset Completo**
```bash
# En .env
SEQUELIZE_FORCE_SYNC=true
SEQUELIZE_ALTER_SYNC=false
SEQUELIZE_AUTO_SYNC=true
```
- 🔥 **ELIMINA TODOS LOS DATOS**
- 🔥 Recrea todas las tablas desde cero
- ⚠️ Solo usar cuando necesites empezar desde cero

### 🏭 **Producción**
```bash
# En .env
SEQUELIZE_AUTO_SYNC=false
```
- 🚫 Sync automático deshabilitado
- ✅ Usar migraciones para cambios en BD
- ✅ Máxima seguridad de datos

---

## 🔄 Flujo de Trabajo Recomendado

### Para Equipos de Desarrollo:

1. **Setup Inicial** (Solo una vez):
   ```bash
   # Configurar .env con modo SAFE
   SEQUELIZE_FORCE_SYNC=false
   SEQUELIZE_ALTER_SYNC=false
   SEQUELIZE_AUTO_SYNC=true
   ```

2. **Desarrollo Diario**:
   - Mantener configuración SAFE
   - Las nuevas tablas se crean automáticamente
   - Los datos se preservan

3. **Cambios en Modelos**:
   ```bash
   # Cambiar temporalmente a ALTER
   SEQUELIZE_ALTER_SYNC=true
   # Iniciar servidor para aplicar cambios
   npm run dev
   # Volver a configuración SAFE
   SEQUELIZE_ALTER_SYNC=false
   ```

4. **Reset cuando sea necesario**:
   ```bash
   # Usando utilidad
   node src/utils/sequelize-sync.js reset
   ```

---

## 🛡️ Medidas de Seguridad

### ⚠️ **Advertencias Automáticas**
El sistema mostrará advertencias cuando:
- `FORCE_SYNC=true` (elimina datos)
- `ALTER_SYNC=true` (modifica estructura)
- Se ejecute en modo RESET

### 🚫 **Protecciones**
- Sync automático deshabilitado en `NODE_ENV=production`
- Mensajes claros sobre qué hace cada modo
- Confirmaciones en operaciones peligrosas

---

## 👥 Guía por Equipo

### **Equipo 1** (Usuarios y Autenticación)
```bash
# Al crear modelos User, Patient, Doctor, Specialty
SEQUELIZE_FORCE_SYNC=false
SEQUELIZE_ALTER_SYNC=false
SEQUELIZE_AUTO_SYNC=true

# Si necesitas reset
node src/utils/sequelize-sync.js reset
```

### **Equipo 2** (Citas y Horarios)
```bash
# Al agregar modelos que dependen del Equipo 1
# Primero asegúrate que Equipo 1 haya terminado sus modelos

# Modo normal
SEQUELIZE_ALTER_SYNC=false

# Si cambias algo en modelos existentes
SEQUELIZE_ALTER_SYNC=true
```

### **Equipo 3** (Historiales y Facturación)
```bash
# Al agregar modelos que dependen de Equipos 1 y 2
# Asegúrate que los otros equipos hayan terminado

# Para agregar nuevas tablas
SEQUELIZE_ALTER_SYNC=false

# Para modificar relaciones existentes
SEQUELIZE_ALTER_SYNC=true
```

---

## 🐛 Troubleshooting

### Error: "Table already exists"
```bash
# Solución: Usar ALTER mode
SEQUELIZE_ALTER_SYNC=true
```

### Error: "Cannot add foreign key constraint"
```bash
# Solución: Reset completo
node src/utils/sequelize-sync.js reset
```

### Error: "Access denied" en Railway
```bash
# Verificar variables de entorno
node src/utils/sequelize-sync.js check
```

### Tablas no se crean
```bash
# Verificar que AUTO_SYNC esté habilitado
SEQUELIZE_AUTO_SYNC=true
```

---

## 📞 Contacto de Equipo

Si tienes problemas con la sincronización:
1. Verificar configuración: `node src/utils/sequelize-sync.js check`
2. Consultar esta documentación
3. Preguntar en el canal de Discord del equipo
4. Como último recurso: reset completo

---

**⚠️ Recuerda: En producción SIEMPRE usar migraciones, nunca sync automático**
