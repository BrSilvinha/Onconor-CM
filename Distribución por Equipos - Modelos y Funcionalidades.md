# Distribución de Trabajo por Equipos - Onconor Clinic Manager

## 👥 Estructura de Equipos (3 equipos de 2 personas)

---

## 🟦 **EQUIPO 1: GESTIÓN DE USUARIOS Y AUTENTICACIÓN**

### **Integrantes:**
- **Becerra Ventura Johan Jherli** (Backend Lead)
- **Sanchez Sanchez Joselyn** (Frontend Lead)

### **📊 Modelos Asignados:**
1. **User** (Usuario base)
2. **Patient** (Paciente)
3. **Doctor** (Médico)
4. **Specialty** (Especialidad)

### **🔧 Responsabilidades Backend:**

#### **Modelos Sequelize:**
```javascript
// User.js - Usuario base
- id, email, password, role, status, createdAt, updatedAt
- Relaciones: hasOne Patient, hasOne Doctor

// Patient.js - Paciente
- id, userId, dni, firstName, lastName, dateOfBirth, gender, phone, address, emergencyContact
- Relaciones: belongsTo User, hasMany Appointment, hasMany MedicalRecord

// Doctor.js - Médico
- id, userId, medicalLicense, firstName, lastName, phone, specialtyId
- Relaciones: belongsTo User, belongsTo Specialty, hasMany Appointment, hasMany Schedule

// Specialty.js - Especialidad médica
- id, name, description, isActive
- Relaciones: hasMany Doctor
```

#### **Controllers:**
- `auth.controller.js` - Login, register, refresh token, logout
- `user.controller.js` - CRUD usuarios, cambio de roles
- `patient.controller.js` - CRUD pacientes, búsqueda, filtros
- `doctor.controller.js` - CRUD médicos, asignación especialidades

#### **Services:**
- `auth.service.js` - JWT, validación credenciales, encriptación
- `user.service.js` - Lógica de negocio usuarios
- `patient.service.js` - Validaciones específicas pacientes
- `doctor.service.js` - Gestión de médicos y especialidades

#### **Repositories:**
- `user.repository.js` - Consultas BD usuarios
- `patient.repository.js` - Consultas BD pacientes
- `doctor.repository.js` - Consultas BD médicos
- `specialty.repository.js` - Consultas BD especialidades

### **💻 Responsabilidades Frontend:**

#### **Páginas:**
- `Login.jsx` - Autenticación
- `Register.jsx` - Registro de usuarios
- `Dashboard.jsx` - Panel principal
- `Patients.jsx` - Gestión de pacientes
- `Doctors.jsx` - Gestión de médicos

#### **Componentes:**
```javascript
// Auth Components
- LoginForm.jsx
- RegisterForm.jsx
- ProtectedRoute.jsx

// Patient Components
- PatientList.jsx
- PatientForm.jsx
- PatientDetail.jsx
- PatientSearch.jsx

// Doctor Components
- DoctorList.jsx
- DoctorForm.jsx
- DoctorDetail.jsx
- SpecialtySelector.jsx
```

#### **Services Frontend:**
- `auth.service.js` - Comunicación con API auth
- `patient.service.js` - CRUD pacientes
- `doctor.service.js` - CRUD médicos

---

## 🟩 **EQUIPO 2: GESTIÓN DE CITAS Y HORARIOS**

### **Integrantes:**
- **Silva Baldera Jhamir Alexander** (Tech Lead)
- **Atalaya Gil Wagner Boris** (QA & Testing)

### **📊 Modelos Asignados:**
1. **Appointment** (Cita médica)
2. **Schedule** (Horario médico)
3. **AppointmentStatus** (Estado de cita)

### **🔧 Responsabilidades Backend:**

#### **Modelos Sequelize:**
```javascript
// Appointment.js - Cita médica
- id, patientId, doctorId, appointmentDate, appointmentTime, reason, status, notes
- Relaciones: belongsTo Patient, belongsTo Doctor, hasOne MedicalRecord

// Schedule.js - Horario médico
- id, doctorId, dayOfWeek, startTime, endTime, isAvailable, breakStart, breakEnd
- Relaciones: belongsTo Doctor

// AppointmentStatus.js - Estados de cita
- id, name, description, color
- Relaciones: hasMany Appointment
```

#### **Controllers:**
- `appointment.controller.js` - CRUD citas, búsqueda por fechas/médico
- `schedule.controller.js` - Gestión horarios médicos
- `availability.controller.js` - Consulta disponibilidad en tiempo real

#### **Services:**
- `appointment.service.js` - Lógica reserva de citas, validaciones horarios
- `schedule.service.js` - Gestión horarios, cálculo disponibilidad
- `notification.service.js` - Notificaciones de citas

#### **Repositories:**
- `appointment.repository.js` - Consultas complejas de citas
- `schedule.repository.js` - Consultas de horarios y disponibilidad

### **💻 Responsabilidades Frontend:**

#### **Páginas:**
- `Appointments.jsx` - Gestión de citas
- `Calendar.jsx` - Vista de calendario
- `Schedules.jsx` - Gestión de horarios médicos

#### **Componentes:**
```javascript
// Appointment Components
- AppointmentList.jsx
- AppointmentForm.jsx
- AppointmentCalendar.jsx
- AppointmentDetail.jsx
- AvailabilityPicker.jsx

// Schedule Components
- ScheduleManager.jsx
- TimeSlotSelector.jsx
- DoctorSchedule.jsx
- CalendarView.jsx
```

#### **Services Frontend:**
- `appointment.service.js` - CRUD citas
- `schedule.service.js` - Gestión horarios
- `calendar.service.js` - Lógica del calendario

---

## 🟨 **EQUIPO 3: HISTORIALES MÉDICOS Y FACTURACIÓN**

### **Integrantes:**
- **Ramírez García Julio Alessandro** (DevOps & Database)
- **José Manuel Diaz Larios** (Business Logic)

### **📊 Modelos Asignados:**
1. **MedicalRecord** (Historial clínico)
2. **Treatment** (Tratamiento)
3. **Prescription** (Receta)
4. **MedicalExam** (Examen médico)
5. **Invoice** (Factura)
6. **Payment** (Pago)

### **🔧 Responsabilidades Backend:**

#### **Modelos Sequelize:**
```javascript
// MedicalRecord.js - Historial clínico
- id, patientId, doctorId, appointmentId, diagnosis, symptoms, observations, date
- Relaciones: belongsTo Patient, belongsTo Doctor, belongsTo Appointment, hasMany Treatment

// Treatment.js - Tratamiento
- id, medicalRecordId, description, medications, instructions, startDate, endDate
- Relaciones: belongsTo MedicalRecord, hasMany Prescription

// Prescription.js - Receta
- id, treatmentId, medication, dosage, frequency, duration, instructions
- Relaciones: belongsTo Treatment

// MedicalExam.js - Examen médico
- id, medicalRecordId, examType, results, filePath, examDate, notes
- Relaciones: belongsTo MedicalRecord

// Invoice.js - Factura
- id, patientId, appointmentId, amount, tax, total, status, issueDate, dueDate
- Relaciones: belongsTo Patient, belongsTo Appointment, hasMany Payment

// Payment.js - Pago
- id, invoiceId, amount, paymentMethod, paymentDate, transactionId, status
- Relaciones: belongsTo Invoice
```

#### **Controllers:**
- `medicalRecord.controller.js` - CRUD historiales médicos
- `treatment.controller.js` - Gestión tratamientos y recetas
- `exam.controller.js` - Gestión exámenes médicos
- `invoice.controller.js` - Facturación
- `payment.controller.js` - Gestión de pagos
- `report.controller.js` - Reportes y estadísticas

#### **Services:**
- `medicalRecord.service.js` - Lógica historiales médicos
- `treatment.service.js` - Gestión tratamientos
- `billing.service.js` - Lógica de facturación
- `report.service.js` - Generación de reportes

#### **Repositories:**
- `medicalRecord.repository.js` - Consultas historiales
- `treatment.repository.js` - Consultas tratamientos
- `billing.repository.js` - Consultas facturación
- `report.repository.js` - Consultas para reportes

### **💻 Responsabilidades Frontend:**

#### **Páginas:**
- `MedicalRecords.jsx` - Historiales médicos
- `Treatments.jsx` - Gestión de tratamientos
- `Billing.jsx` - Facturación
- `Reports.jsx` - Reportes y estadísticas

#### **Componentes:**
```javascript
// Medical Record Components
- MedicalRecordList.jsx
- MedicalRecordForm.jsx
- MedicalRecordDetail.jsx
- DiagnosisForm.jsx

// Treatment Components
- TreatmentList.jsx
- TreatmentForm.jsx
- PrescriptionForm.jsx
- ExamUpload.jsx

// Billing Components
- InvoiceList.jsx
- InvoiceForm.jsx
- PaymentForm.jsx
- BillingDashboard.jsx

// Report Components
- ReportGenerator.jsx
- StatisticsCard.jsx
- ChartComponents.jsx
```

#### **Services Frontend:**
- `medicalRecord.service.js` - CRUD historiales
- `treatment.service.js` - CRUD tratamientos
- `billing.service.js` - CRUD facturación
- `report.service.js` - Generación reportes

---

## 📊 **Análisis de Carga de Trabajo**

| **Equipo** | **Modelos** | **Controllers** | **Componentes** | **Complejidad** |
|------------|-------------|----------------|----------------|-----------------|
| **Equipo 1** | 4 modelos | 4 controllers | ~12 componentes | Media-Alta |
| **Equipo 2** | 3 modelos | 3 controllers | ~10 componentes | Alta |
| **Equipo 3** | 6 modelos | 6 controllers | ~15 componentes | Alta |

---

## 🔄 **Metodología de Trabajo por Equipo**

### **Flujo de Desarrollo:**
1. **Diseño de Modelos** → Definir esquemas y relaciones
2. **Backend Development** → Modelos → Repositories → Services → Controllers
3. **API Testing** → Probar endpoints con Postman
4. **Frontend Development** → Services → Components → Pages
5. **Integration Testing** → Conectar Frontend con Backend
6. **Code Review** → Revisión cruzada entre equipos

### **Dependencias entre Equipos:**
- **Equipo 1** debe completar User/Patient/Doctor antes que los otros equipos
- **Equipo 2** depende de Patient y Doctor del Equipo 1
- **Equipo 3** depende de Patient, Doctor y Appointment de equipos anteriores

### **Cronograma Sugerido:**
- **Semana 1-2**: Equipo 1 (Usuarios base)
- **Semana 2-3**: Equipo 2 (Citas) - paralelo con Equipo 1
- **Semana 3-4**: Equipo 3 (Historiales) - dependiente de ambos equipos
- **Semana 4-5**: Integración y testing conjunto

---

## 🎯 **Entregables por Equipo**

### **Backend (cada equipo):**
- ✅ Modelos Sequelize con relaciones
- ✅ Migraciones de base de datos
- ✅ Seeders con datos de prueba
- ✅ Repositories para consultas
- ✅ Services con lógica de negocio
- ✅ Controllers con endpoints REST
- ✅ Tests unitarios
- ✅ Documentación de API

### **Frontend (cada equipo):**
- ✅ Servicios de comunicación con API
- ✅ Componentes reutilizables
- ✅ Páginas principales
- ✅ Formularios con validación
- ✅ Estados de carga y error
- ✅ Tests de componentes
- ✅ Documentación de componentes

---

## 🚀 **Ventajas de esta Distribución**

1. **Especialización**: Cada equipo se vuelve experto en su dominio
2. **Paralelización**: Trabajo simultáneo con dependencias mínimas
3. **Responsabilidad**: Cada equipo es dueño de su funcionalidad completa
4. **Escalabilidad**: Fácil mantenimiento y evolución del código
5. **Testing**: Cada equipo puede hacer tests completos de su módulo

¿Te parece bien esta distribución? ¿Quieres ajustar algún modelo o responsabilidad entre los equipos?