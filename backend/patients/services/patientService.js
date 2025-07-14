const patientRepository = require('../repositories/patientRepository');
const userRepository = require('../../users/repositories/userRepository');

class PatientService {

    // Validar datos del paciente
    validatePatientData(patientData) {
        const errors = [];

        // Validar DNI
        if (!patientData.dni || patientData.dni.trim() === '') {
            errors.push('El DNI es obligatorio');
        } else if (!/^\d{8}$/.test(patientData.dni)) {
            errors.push('El DNI debe tener exactamente 8 dígitos');
        }

        // Validar nombres
        if (!patientData.firstName || patientData.firstName.trim() === '') {
            errors.push('El nombre es obligatorio');
        } else if (patientData.firstName.length < 2 || patientData.firstName.length > 100) {
            errors.push('El nombre debe tener entre 2 y 100 caracteres');
        }

        if (!patientData.lastName || patientData.lastName.trim() === '') {
            errors.push('El apellido es obligatorio');
        } else if (patientData.lastName.length < 2 || patientData.lastName.length > 100) {
            errors.push('El apellido debe tener entre 2 y 100 caracteres');
        }

        // Validar fecha de nacimiento
        if (!patientData.dateOfBirth) {
            errors.push('La fecha de nacimiento es obligatoria');
        } else {
            const birthDate = new Date(patientData.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            
            if (age < 0 || age > 150) {
                errors.push('La fecha de nacimiento no es válida');
            }
        }

        // Validar género
        if (!patientData.gender || !['M', 'F', 'O'].includes(patientData.gender)) {
            errors.push('El género debe ser M (Masculino), F (Femenino) o O (Otro)');
        }

        // Validar teléfono (opcional pero si existe debe ser válido)
        if (patientData.phone && !/^\+?[\d\s\-\(\)]{7,20}$/.test(patientData.phone)) {
            errors.push('El formato del teléfono no es válido');
        }

        return errors;
    }

    // Calcular edad del paciente
    calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // Crear paciente con validaciones de negocio
    async createPatientWithValidation(patientData, userId) {
        try {
            // Validar datos
            const validationErrors = this.validatePatientData(patientData);
            if (validationErrors.length > 0) {
                throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
            }

            // Verificar que el usuario existe
            const user = await userRepository.findById(patientData.userId);
            if (!user) {
                throw new Error('El usuario especificado no existe');
            }

            // Verificar que el usuario no tiene ya un paciente asociado
            const existingPatient = await patientRepository.findByUserId(patientData.userId);
            if (existingPatient) {
                throw new Error('El usuario ya tiene un paciente asociado');
            }

            // Verificar DNI único
            const dniExists = await patientRepository.checkPatientExists(patientData.dni);
            if (dniExists) {
                throw new Error('Ya existe un paciente con este DNI');
            }

            // Crear paciente
            patientData.user_created = userId;
            const patient = await patientRepository.createPatient(patientData);

            return patient;

        } catch (error) {
            throw new Error(`Error al crear paciente: ${error.message}`);
        }
    }

    // Actualizar paciente con validaciones
    async updatePatientWithValidation(patientId, updateData, userId) {
        try {
            // Verificar que el paciente existe
            const existingPatient = await patientRepository.findById(patientId);
            if (!existingPatient) {
                throw new Error('Paciente no encontrado');
            }

            // Validar solo los campos que se están actualizando
            if (updateData.dni || updateData.firstName || updateData.lastName || 
                updateData.dateOfBirth || updateData.gender) {
                
                // Combinar datos existentes con actualizaciones para validación completa
                const dataToValidate = {
                    dni: updateData.dni || existingPatient.dni,
                    firstName: updateData.firstName || existingPatient.firstName,
                    lastName: updateData.lastName || existingPatient.lastName,
                    dateOfBirth: updateData.dateOfBirth || existingPatient.dateOfBirth,
                    gender: updateData.gender || existingPatient.gender,
                    phone: updateData.phone !== undefined ? updateData.phone : existingPatient.phone
                };

                const validationErrors = this.validatePatientData(dataToValidate);
                if (validationErrors.length > 0) {
                    throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
                }
            }

            // Verificar DNI único si se está actualizando
            if (updateData.dni) {
                const dniExists = await patientRepository.checkPatientExists(updateData.dni, patientId);
                if (dniExists) {
                    throw new Error('Ya existe un paciente con este DNI');
                }
            }

            // Actualizar paciente
            updateData.user_updated = userId;
            const updated = await patientRepository.updatePatient(patientId, updateData);
            
            if (!updated) {
                throw new Error('No se pudo actualizar el paciente');
            }

            return await patientRepository.findById(patientId);

        } catch (error) {
            throw new Error(`Error al actualizar paciente: ${error.message}`);
        }
    }

    // Obtener perfil completo del paciente
    async getPatientProfile(patientId) {
        try {
            const patient = await patientRepository.findById(patientId);
            if (!patient) {
                throw new Error('Paciente no encontrado');
            }

            // Calcular edad
            const age = this.calculateAge(patient.dateOfBirth);

            // Formato de respuesta enriquecido
            const profile = {
                ...patient.toJSON(),
                age,
                fullName: `${patient.firstName} ${patient.lastName}`,
                genderDisplay: patient.gender === 'M' ? 'Masculino' : 
                             patient.gender === 'F' ? 'Femenino' : 'Otro'
            };

            return profile;

        } catch (error) {
            throw new Error(`Error al obtener perfil del paciente: ${error.message}`);
        }
    }

    // Buscar pacientes con lógica de negocio
    async searchPatientsWithBusinessLogic(filters, pagination = null) {
        try {
            // Limpiar y validar filtros
            const cleanFilters = {};
            
            if (filters.search) {
                cleanFilters.search = filters.search.trim();
            }
            
            if (filters.gender && ['M', 'F', 'O'].includes(filters.gender)) {
                cleanFilters.gender = filters.gender;
            }

            let result;
            if (pagination) {
                result = await patientRepository.findWithPagination(
                    pagination.page, 
                    pagination.limit, 
                    cleanFilters
                );
                
                // Enriquecer datos con edad
                result.patients = result.patients.map(patient => ({
                    ...patient.toJSON(),
                    age: this.calculateAge(patient.dateOfBirth),
                    fullName: `${patient.firstName} ${patient.lastName}`
                }));
            } else {
                const patients = await patientRepository.findAllActive(cleanFilters);
                result = {
                    patients: patients.map(patient => ({
                        ...patient.toJSON(),
                        age: this.calculateAge(patient.dateOfBirth),
                        fullName: `${patient.firstName} ${patient.lastName}`
                    })),
                    total: patients.length
                };
            }

            return result;

        } catch (error) {
            throw new Error(`Error en búsqueda de pacientes: ${error.message}`);
        }
    }

    // Validar antes de desactivar paciente
    async validatePatientDeactivation(patientId) {
        try {
            const patient = await patientRepository.findById(patientId);
            if (!patient) {
                throw new Error('Paciente no encontrado');
            }

            // Aquí se pueden agregar validaciones adicionales
            // Por ejemplo, verificar si tiene citas pendientes, historiales activos, etc.
            // Esto dependerá de los otros módulos del sistema

            return { canDeactivate: true, patient };

        } catch (error) {
            throw new Error(`Error al validar desactivación: ${error.message}`);
        }
    }

    // Obtener estadísticas con análisis de negocio
    async getEnhancedPatientStats() {
        try {
            const stats = await patientRepository.getPatientStats();

            // Calcular estadísticas adicionales
            const genderPercentages = stats.byGender.map(gender => ({
                gender: gender.gender,
                count: parseInt(gender.dataValues.count),
                percentage: ((parseInt(gender.dataValues.count) / stats.active) * 100).toFixed(1)
            }));

            return {
                ...stats,
                genderPercentages,
                activePercentage: ((stats.active / stats.total) * 100).toFixed(1),
                inactivePercentage: ((stats.inactive / stats.total) * 100).toFixed(1)
            };

        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    // Generar reporte de paciente
    async generatePatientReport(patientId) {
        try {
            const patient = await patientRepository.findById(patientId);
            if (!patient) {
                throw new Error('Paciente no encontrado');
            }

            const age = this.calculateAge(patient.dateOfBirth);
            const report = {
                basicInfo: {
                    fullName: `${patient.firstName} ${patient.lastName}`,
                    dni: patient.dni,
                    age: age,
                    gender: patient.gender === 'M' ? 'Masculino' : 
                           patient.gender === 'F' ? 'Femenino' : 'Otro',
                    dateOfBirth: patient.dateOfBirth,
                    phone: patient.phone,
                    address: patient.address,
                    emergencyContact: patient.emergencyContact
                },
                systemInfo: {
                    patientId: patient.id,
                    userId: patient.userId,
                    active: patient.active,
                    createdAt: patient.created_at,
                    updatedAt: patient.updated_at
                },
                generatedAt: new Date(),
                generatedBy: 'Sistema Onconor'
            };

            return report;

        } catch (error) {
            throw new Error(`Error al generar reporte: ${error.message}`);
        }
    }
}

module.exports = new PatientService();