const doctorRepository = require('../repositories/doctorRepository');
const userRepository = require('../../users/repositories/userRepository');
const specialtyRepository = require('../../specialties/repositories/specialtyRepository');

class DoctorService {

    // Validar datos del médico
    validateDoctorData(doctorData) {
        const errors = [];

        // Validar licencia médica
        if (!doctorData.medicalLicense || doctorData.medicalLicense.trim() === '') {
            errors.push('La licencia médica es obligatoria');
        } else if (!/^[A-Z0-9\-]{5,50}$/.test(doctorData.medicalLicense)) {
            errors.push('La licencia médica debe tener entre 5 y 50 caracteres alfanuméricos');
        }

        // Validar nombres
        if (!doctorData.firstName || doctorData.firstName.trim() === '') {
            errors.push('El nombre es obligatorio');
        } else if (doctorData.firstName.length < 2 || doctorData.firstName.length > 100) {
            errors.push('El nombre debe tener entre 2 y 100 caracteres');
        }

        if (!doctorData.lastName || doctorData.lastName.trim() === '') {
            errors.push('El apellido es obligatorio');
        } else if (doctorData.lastName.length < 2 || doctorData.lastName.length > 100) {
            errors.push('El apellido debe tener entre 2 y 100 caracteres');
        }

        // Validar especialidad
        if (!doctorData.specialtyId || !Number.isInteger(Number(doctorData.specialtyId))) {
            errors.push('La especialidad es obligatoria y debe ser válida');
        }

        // Validar teléfono (opcional pero si existe debe ser válido)
        if (doctorData.phone && !/^\+?[\d\s\-\(\)]{7,20}$/.test(doctorData.phone)) {
            errors.push('El formato del teléfono no es válido');
        }

        return errors;
    }

    // Crear médico con validaciones de negocio
    async createDoctorWithValidation(doctorData, userId) {
        try {
            // Validar datos
            const validationErrors = this.validateDoctorData(doctorData);
            if (validationErrors.length > 0) {
                throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
            }

            // Verificar que el usuario existe
            const user = await userRepository.findById(doctorData.userId);
            if (!user) {
                throw new Error('El usuario especificado no existe');
            }

            // Verificar que el usuario no tiene ya un médico asociado
            const existingDoctor = await doctorRepository.findByUserId(doctorData.userId);
            if (existingDoctor) {
                throw new Error('El usuario ya tiene un médico asociado');
            }

            // Verificar licencia médica única
            const licenseExists = await doctorRepository.checkDoctorExists(doctorData.medicalLicense);
            if (licenseExists) {
                throw new Error('Ya existe un médico con esta licencia médica');
            }

            // Verificar que la especialidad existe y está activa
            const specialty = await specialtyRepository.findById(doctorData.specialtyId);
            if (!specialty) {
                throw new Error('La especialidad especificada no existe');
            }
            if (!specialty.isActive) {
                throw new Error('La especialidad especificada no está activa');
            }

            // Crear médico
            doctorData.user_created = userId;
            const doctor = await doctorRepository.createDoctor(doctorData);

            return doctor;

        } catch (error) {
            throw new Error(`Error al crear médico: ${error.message}`);
        }
    }

    // Actualizar médico con validaciones
    async updateDoctorWithValidation(doctorId, updateData, userId) {
        try {
            // Verificar que el médico existe
            const existingDoctor = await doctorRepository.findById(doctorId);
            if (!existingDoctor) {
                throw new Error('Médico no encontrado');
            }

            // Validar solo los campos que se están actualizando
            if (updateData.medicalLicense || updateData.firstName || updateData.lastName || 
                updateData.specialtyId) {
                
                // Combinar datos existentes con actualizaciones para validación completa
                const dataToValidate = {
                    medicalLicense: updateData.medicalLicense || existingDoctor.medicalLicense,
                    firstName: updateData.firstName || existingDoctor.firstName,
                    lastName: updateData.lastName || existingDoctor.lastName,
                    specialtyId: updateData.specialtyId || existingDoctor.specialtyId,
                    phone: updateData.phone !== undefined ? updateData.phone : existingDoctor.phone
                };

                const validationErrors = this.validateDoctorData(dataToValidate);
                if (validationErrors.length > 0) {
                    throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
                }
            }

            // Verificar licencia médica única si se está actualizando
            if (updateData.medicalLicense) {
                const licenseExists = await doctorRepository.checkDoctorExists(updateData.medicalLicense, doctorId);
                if (licenseExists) {
                    throw new Error('Ya existe un médico con esta licencia médica');
                }
            }

            // Verificar especialidad si se está actualizando
            if (updateData.specialtyId) {
                const specialty = await specialtyRepository.findById(updateData.specialtyId);
                if (!specialty) {
                    throw new Error('La especialidad especificada no existe');
                }
                if (!specialty.isActive) {
                    throw new Error('La especialidad especificada no está activa');
                }
            }

            // Actualizar médico
            updateData.user_updated = userId;
            const updated = await doctorRepository.updateDoctor(doctorId, updateData);
            
            if (!updated) {
                throw new Error('No se pudo actualizar el médico');
            }

            return await doctorRepository.findById(doctorId);

        } catch (error) {
            throw new Error(`Error al actualizar médico: ${error.message}`);
        }
    }

    // Cambiar especialidad con validaciones
    async changeSpecialtyWithValidation(doctorId, newSpecialtyId, userId) {
        try {
            // Verificar que el médico existe
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Médico no encontrado');
            }

            // Verificar que la nueva especialidad existe y está activa
            const newSpecialty = await specialtyRepository.findById(newSpecialtyId);
            if (!newSpecialty) {
                throw new Error('La nueva especialidad no existe');
            }
            if (!newSpecialty.isActive) {
                throw new Error('La nueva especialidad no está activa');
            }

            // Verificar que no es la misma especialidad
            if (doctor.specialtyId === parseInt(newSpecialtyId)) {
                throw new Error('El médico ya pertenece a esta especialidad');
            }

            // Cambiar especialidad
            const updated = await doctorRepository.changeSpecialty(doctorId, newSpecialtyId, userId);
            if (!updated) {
                throw new Error('No se pudo cambiar la especialidad');
            }

            return await doctorRepository.findById(doctorId);

        } catch (error) {
            throw new Error(`Error al cambiar especialidad: ${error.message}`);
        }
    }

    // Obtener perfil completo del médico
    async getDoctorProfile(doctorId) {
        try {
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Médico no encontrado');
            }

            // Formato de respuesta enriquecido
            const profile = {
                ...doctor.toJSON(),
                fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                specialtyName: doctor.specialty ? doctor.specialty.name : 'Sin especialidad',
                displayTitle: `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty ? doctor.specialty.name : 'Sin especialidad'}`
            };

            return profile;

        } catch (error) {
            throw new Error(`Error al obtener perfil del médico: ${error.message}`);
        }
    }

    // Buscar médicos con lógica de negocio
    async searchDoctorsWithBusinessLogic(filters, pagination = null) {
        try {
            // Limpiar y validar filtros
            const cleanFilters = {};
            
            if (filters.search) {
                cleanFilters.search = filters.search.trim();
            }
            
            if (filters.specialtyId && Number.isInteger(Number(filters.specialtyId))) {
                cleanFilters.specialtyId = parseInt(filters.specialtyId);
            }

            let result;
            if (pagination) {
                result = await doctorRepository.findWithPagination(
                    pagination.page, 
                    pagination.limit, 
                    cleanFilters
                );
                
                // Enriquecer datos
                result.doctors = result.doctors.map(doctor => ({
                    ...doctor.toJSON(),
                    fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                    specialtyName: doctor.specialty ? doctor.specialty.name : 'Sin especialidad'
                }));
            } else {
                const doctors = await doctorRepository.findAllActive(cleanFilters);
                result = {
                    doctors: doctors.map(doctor => ({
                        ...doctor.toJSON(),
                        fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                        specialtyName: doctor.specialty ? doctor.specialty.name : 'Sin especialidad'
                    })),
                    total: doctors.length
                };
            }

            return result;

        } catch (error) {
            throw new Error(`Error en búsqueda de médicos: ${error.message}`);
        }
    }

    // Obtener médicos por especialidad con validaciones
    async getDoctorsBySpecialtyWithValidation(specialtyId) {
        try {
            // Verificar que la especialidad existe
            const specialty = await specialtyRepository.findById(specialtyId);
            if (!specialty) {
                throw new Error('Especialidad no encontrada');
            }

            const doctors = await doctorRepository.findBySpecialty(specialtyId);

            // Enriquecer datos
            const enrichedDoctors = doctors.map(doctor => ({
                ...doctor.toJSON(),
                fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                specialtyName: specialty.name
            }));

            return {
                specialty: specialty,
                doctors: enrichedDoctors,
                total: enrichedDoctors.length
            };

        } catch (error) {
            throw new Error(`Error al obtener médicos por especialidad: ${error.message}`);
        }
    }

    // Validar antes de desactivar médico
    async validateDoctorDeactivation(doctorId) {
        try {
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Médico no encontrado');
            }

            // Aquí se pueden agregar validaciones adicionales
            // Por ejemplo, verificar si tiene citas pendientes, horarios asignados, etc.
            // Esto dependerá de los otros módulos del sistema

            return { canDeactivate: true, doctor };

        } catch (error) {
            throw new Error(`Error al validar desactivación: ${error.message}`);
        }
    }

    // Obtener estadísticas con análisis de negocio
    async getEnhancedDoctorStats() {
        try {
            const stats = await doctorRepository.getDoctorStats();

            // Calcular estadísticas adicionales
            const specialtyDistribution = stats.bySpecialty.map(item => ({
                specialtyId: item.specialtyId,
                specialtyName: item.specialty ? item.specialty.name : 'Sin especialidad',
                count: parseInt(item.dataValues.count),
                percentage: ((parseInt(item.dataValues.count) / stats.active) * 100).toFixed(1)
            }));

            return {
                ...stats,
                specialtyDistribution,
                activePercentage: ((stats.active / stats.total) * 100).toFixed(1),
                inactivePercentage: ((stats.inactive / stats.total) * 100).toFixed(1)
            };

        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    // Generar reporte de médico
    async generateDoctorReport(doctorId) {
        try {
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Médico no encontrado');
            }

            const report = {
                basicInfo: {
                    fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                    medicalLicense: doctor.medicalLicense,
                    phone: doctor.phone,
                    specialty: doctor.specialty ? doctor.specialty.name : 'Sin especialidad',
                    specialtyDescription: doctor.specialty ? doctor.specialty.description : null
                },
                systemInfo: {
                    doctorId: doctor.id,
                    userId: doctor.userId,
                    specialtyId: doctor.specialtyId,
                    active: doctor.active,
                    createdAt: doctor.created_at,
                    updatedAt: doctor.updated_at
                },
                generatedAt: new Date(),
                generatedBy: 'Sistema Onconor'
            };

            return report;

        } catch (error) {
            throw new Error(`Error al generar reporte: ${error.message}`);
        }
    }

    // Verificar disponibilidad de horarios (placeholder para futura integración)
    async checkDoctorAvailability(doctorId, date, time) {
        try {
            const doctor = await doctorRepository.findById(doctorId);
            if (!doctor) {
                throw new Error('Médico no encontrado');
            }

            // Esta funcionalidad se integrará con el módulo de horarios/citas
            // Por ahora retorna estructura base
            return {
                doctorId: doctorId,
                date: date,
                time: time,
                available: true, // Placeholder
                message: 'Funcionalidad pendiente de integración con módulo de horarios'
            };

        } catch (error) {
            throw new Error(`Error al verificar disponibilidad: ${error.message}`);
        }
    }
}

module.exports = new DoctorService();