# 🧪 Guía de Testing con Postman - Onconor Clinic Manager Team 1

## 📦 Archivos de Postman Incluidos

### 1. **Colección Principal**
- 📁 `Onconor_Clinic_Manager_Team1.postman_collection.json`
- **36 requests** organizados en 5 carpetas
- Scripts automáticos para manejo de tokens e IDs
- Tests globales de tiempo de respuesta y códigos de estado

### 2. **Environments (Entornos)**
- 🔧 `Onconor_Development.postman_environment.json` - Para desarrollo local
- 🚀 `Onconor_Production.postman_environment.json` - Para producción

---

## 🚀 Configuración Inicial

### Paso 1: Importar en Postman
1. Abrir Postman
2. Clic en **Import**
3. Seleccionar los 3 archivos JSON:
   - Collection
   - Development Environment  
   - Production Environment

### Paso 2: Configurar Environment
1. Seleccionar **"Onconor Development"** en el dropdown de environments
2. Verificar que `baseUrl` esté configurado como: `http://localhost:3001`
3. Los demás valores se autocompletarán durante las pruebas

### Paso 3: Iniciar el Servidor
```bash
cd backend
npm run dev
```

---

## 📋 Estructura de la Colección

### 🔐 **1. Authentication (4 requests)**
- **Login** - Autentica usuario y guarda token automáticamente
- **Register User** - Registra nuevo usuario
- **Refresh Token** - Renueva token de autenticación
- **Logout** - Cierra sesión

### 👥 **2. Users (6 requests)**
- **Get User by ID** - Obtiene usuario por ID
- **Update User** - Actualiza datos del usuario
- **Search Users** - Busca usuarios por término
- **Get Users by Establishment** - Lista usuarios por establecimiento
- **Deactivate User** - Desactiva usuario (soft delete)
- **Activate User** - Reactiva usuario

### 🏥 **3. Patients (11 requests)**
- **Create Patient** - Crea paciente y guarda ID automáticamente
- **Get Patient by ID** - Obtiene paciente por ID
- **Get Patient by DNI** - Busca paciente por DNI
- **Update Patient** - Actualiza datos del paciente
- **Get Active Patients** - Lista pacientes activos
- **Get Patients Paginated** - Lista con paginación
- **Search Patients** - Busca con filtros
- **Get Patient Statistics** - Estadísticas generales
- **Check DNI Availability** - Verifica disponibilidad de DNI
- **Deactivate Patient** - Desactiva paciente
- **Activate Patient** - Reactiva paciente

### 🩺 **4. Specialties (11 requests)**
- **Create Specialty** - Crea especialidad y guarda ID automáticamente
- **Get Specialty by ID** - Obtiene especialidad por ID
- **Get Specialty with Doctors** - Especialidad con médicos asociados
- **Update Specialty** - Actualiza datos de especialidad
- **Get Active Specialties** - Lista especialidades activas
- **Get All Specialties** - Lista todas (activas e inactivas)
- **Get Specialties Paginated** - Lista con paginación
- **Search Specialties** - Busca especialidades
- **Get Specialty Statistics** - Estadísticas de especialidades
- **Check Name Availability** - Verifica disponibilidad de nombre
- **Deactivate Specialty** - Desactiva especialidad
- **Activate Specialty** - Reactiva especialidad

### 👨‍⚕️ **5. Doctors (13 requests)**
- **Create Doctor** - Crea médico y guarda ID automáticamente
- **Get Doctor by ID** - Obtiene médico por ID
- **Get Doctor by License** - Busca por licencia médica
- **Update Doctor** - Actualiza datos del médico
- **Get Active Doctors** - Lista médicos activos
- **Get Doctors Paginated** - Lista con paginación
- **Get Doctors by Specialty** - Médicos por especialidad
- **Search Doctors** - Busca médicos con filtros
- **Change Doctor Specialty** - Cambia especialidad del médico
- **Get Doctor Statistics** - Estadísticas de médicos
- **Check License Availability** - Verifica disponibilidad de licencia
- **Deactivate Doctor** - Desactiva médico
- **Activate Doctor** - Reactiva médico

---

## 🧪 Flujo de Testing Recomendado

### **Fase 1: Autenticación**
1. **Register User** - Registrar usuario de prueba
2. **Login** - Autenticar (guarda token automáticamente)
3. **Refresh Token** - Verificar renovación de token

### **Fase 2: Especialidades (Prerequisito para médicos)**
1. **Create Specialty** - Crear "Cardiología"
2. **Get Active Specialties** - Verificar lista
3. **Update Specialty** - Modificar descripción
4. **Get Specialty Statistics** - Verificar estadísticas

### **Fase 3: Pacientes**
1. **Create Patient** - Crear paciente de prueba
2. **Get Patient by ID** - Verificar creación
3. **Get Patient by DNI** - Buscar por DNI
4. **Update Patient** - Modificar datos
5. **Search Patients** - Probar búsqueda con filtros
6. **Get Patient Statistics** - Verificar estadísticas

### **Fase 4: Médicos**
1. **Create Doctor** - Crear médico (requiere specialtyId)
2. **Get Doctor by ID** - Verificar creación
3. **Get Doctors by Specialty** - Filtrar por especialidad
4. **Change Doctor Specialty** - Cambiar especialidad
5. **Get Doctor Statistics** - Verificar estadísticas

### **Fase 5: Gestión de Usuario**
1. **Get User by ID** - Obtener perfil completo
2. **Update User** - Modificar datos
3. **Search Users** - Buscar usuarios

---

## 🔧 Variables de Entorno Automáticas

La colección maneja automáticamente estas variables:

| Variable | Descripción | Se actualiza en |
|----------|-------------|-----------------|
| `token` | JWT Token | Login request |
| `userId` | ID del usuario | Login request |
| `patientId` | ID del paciente | Create Patient |
| `doctorId` | ID del médico | Create Doctor |
| `specialtyId` | ID de especialidad | Create Specialty |

---

## 📊 Tests Automáticos Incluidos

### **Tests Globales (en todas las requests)**
- ✅ Tiempo de respuesta < 5000ms
- ✅ Código de estado exitoso (200, 201, 204)

### **Tests Específicos**
- 🔐 **Login**: Guarda token y userId automáticamente
- 🏥 **Create Patient**: Guarda patientId para requests posteriores
- 👨‍⚕️ **Create Doctor**: Guarda doctorId para requests posteriores
- 🩺 **Create Specialty**: Guarda specialtyId para requests posteriores

---

## 📝 Datos de Prueba Incluidos

### **Usuario de Login**
```json
{
    "email": "admin@onconor.com",
    "password": "Admin123"
}
```

### **Paciente de Prueba**
```json
{
    "dni": "87654321",
    "firstName": "María",
    "lastName": "González",
    "dateOfBirth": "1990-05-15",
    "gender": "F",
    "phone": "+51987654321",
    "address": "Av. Principal 123, Lima"
}
```

### **Médico de Prueba**
```json
{
    "medicalLicense": "CMP-12345",
    "firstName": "Carlos",
    "lastName": "Rodríguez",
    "phone": "+51912345678"
}
```

### **Especialidad de Prueba**
```json
{
    "name": "Cardiología",
    "description": "Especialidad médica del corazón",
    "isActive": true
}
```

---

## 🚨 Troubleshooting

### **Error: "No token provided"**
- Asegúrate de ejecutar **Login** primero
- Verifica que el environment esté seleccionado
- El token se guarda automáticamente en Login

### **Error: "User not found"**
- Ejecuta **Register User** antes de Login
- O usa credenciales válidas existentes

### **Error: "Specialty not found"**
- Crea una especialidad antes de crear médicos
- Verifica que `specialtyId` esté en el environment

### **Error de conexión**
- Verifica que el servidor esté corriendo: `npm run dev`
- Confirma que `baseUrl` sea `http://localhost:3001`

---

## 🎯 Casos de Prueba Avanzados

### **Validaciones**
- Probar DNI duplicado en pacientes
- Probar licencia médica duplicada
- Probar especialidad con nombre duplicado
- Validar formatos de teléfono, email, fechas

### **Relaciones**
- Crear médico con especialidad válida
- Intentar crear médico con especialidad inexistente
- Desactivar especialidad con médicos asociados (debe fallar)

### **Búsquedas**
- Buscar pacientes por nombre parcial
- Filtrar médicos por especialidad
- Buscar con paginación

### **Estadísticas**
- Verificar conteos después de crear/desactivar
- Comprobar distribución por género en pacientes
- Validar distribución por especialidad en médicos

---

## 📈 Métricas de Performance

Los tests incluyen validaciones de:
- ⏱️ **Tiempo de respuesta**: < 5 segundos
- ✅ **Códigos de estado**: 200, 201, 204
- 🔒 **Autenticación**: Token válido en headers

---

## 🎉 ¡Listo para Testing!

1. Importa los 3 archivos JSON en Postman
2. Selecciona "Onconor Development" environment
3. Ejecuta las requests en el orden recomendado
4. ¡Todas las variables se manejan automáticamente!

**¡Happy Testing! 🚀**