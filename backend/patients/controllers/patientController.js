const patientRepository = require('../repositories/patientRepository');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class PatientController {
    
    // Crear nuevo paciente
    async createPatient(req, res) {
        try {
            const patientData = req.body;

            // Verificar que no existe un paciente con el mismo DNI
            const existingPatient = await patientRepository.findByDni(patientData.dni);
            if (existingPatient) {
                return apiResponse.conflict(res, 'Ya existe un paciente con este DNI');
            }

            // Agregar información de auditoría
            patientData.user_created = req.user.userId;

            const patient = await patientRepository.createPatient(patientData);

            return apiResponse.success(res, 'Paciente creado exitosamente', { patient });

        } catch (error) {
            console.error('Error al crear paciente:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener paciente por ID
    async getPatientById(req, res) {
        try {
            const { id } = req.params;

            const patient = await patientRepository.findById(id);
            if (!patient) {
                return apiResponse.notFound(res, 'Paciente no encontrado');
            }

            return apiResponse.success(res, 'Paciente obtenido exitosamente', { patient });

        } catch (error) {
            console.error('Error al obtener paciente:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener paciente por DNI
    async getPatientByDni(req, res) {
        try {
            const { dni } = req.params;

            const patient = await patientRepository.findByDni(dni);
            if (!patient) {
                return apiResponse.notFound(res, 'Paciente no encontrado');
            }

            return apiResponse.success(res, 'Paciente obtenido exitosamente', { patient });

        } catch (error) {
            console.error('Error al obtener paciente por DNI:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Actualizar paciente
    async updatePatient(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validar que el paciente existe
            const existingPatient = await patientRepository.findById(id);
            if (!existingPatient) {
                return apiResponse.notFound(res, 'Paciente no encontrado');
            }

            // Verificar si hay conflicto con DNI
            if (updateData.dni) {
                const patientWithDni = await patientRepository.findByDni(updateData.dni);
                if (patientWithDni && patientWithDni.id !== parseInt(id)) {
                    return apiResponse.conflict(res, 'Ya existe un paciente con este DNI');
                }
            }

            // Agregar información de auditoría
            updateData.user_updated = req.user.userId;

            // No permitir actualizar ciertos campos sensibles
            delete updateData.id;
            delete updateData.userId;
            delete updateData.created_at;
            delete updateData.updated_at;
            delete updateData.flg_deleted;
            delete updateData.deleted_at;

            const updated = await patientRepository.updatePatient(id, updateData);
            if (!updated) {
                return apiResponse.error(res, 'Error al actualizar paciente');
            }

            // Obtener el paciente actualizado
            const updatedPatient = await patientRepository.findById(id);

            return apiResponse.success(res, 'Paciente actualizado exitosamente', { patient: updatedPatient });

        } catch (error) {
            console.error('Error al actualizar paciente:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar pacientes activos
    async getActivePatients(req, res) {
        try {
            const filters = {
                search: req.query.search,
                gender: req.query.gender
            };

            const patients = await patientRepository.findAllActive(filters);

            return apiResponse.success(res, 'Pacientes obtenidos exitosamente', { 
                patients,
                total: patients.length 
            });

        } catch (error) {
            console.error('Error al obtener pacientes activos:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar pacientes con paginación
    async getPatientsWithPagination(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                search: req.query.search,
                gender: req.query.gender
            };

            const result = await patientRepository.findWithPagination(page, limit, filters);

            return apiResponse.success(res, 'Pacientes obtenidos exitosamente', result);

        } catch (error) {
            console.error('Error al obtener pacientes con paginación:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Desactivar paciente (soft delete)
    async deactivatePatient(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el paciente existe
            const patient = await patientRepository.findById(id);
            if (!patient) {
                return apiResponse.notFound(res, 'Paciente no encontrado');
            }

            const deactivated = await patientRepository.deactivatePatient(id, req.user.userId);
            if (!deactivated) {
                return apiResponse.error(res, 'Error al desactivar paciente');
            }

            return apiResponse.success(res, 'Paciente desactivado exitosamente');

        } catch (error) {
            console.error('Error al desactivar paciente:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Activar paciente
    async activatePatient(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el paciente existe
            const patient = await patientRepository.findById(id);
            if (!patient) {
                return apiResponse.notFound(res, 'Paciente no encontrado');
            }

            const activated = await patientRepository.activatePatient(id);
            if (!activated) {
                return apiResponse.error(res, 'Error al activar paciente');
            }

            return apiResponse.success(res, 'Paciente activado exitosamente');

        } catch (error) {
            console.error('Error al activar paciente:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Buscar pacientes
    async searchPatients(req, res) {
        try {
            const { search, gender, page = 1, limit = 10 } = req.query;

            const filters = {};
            if (search) filters.search = search;
            if (gender) filters.gender = gender;

            if (page && limit) {
                // Búsqueda con paginación
                const result = await patientRepository.findWithPagination(
                    parseInt(page), 
                    parseInt(limit), 
                    filters
                );
                return apiResponse.success(res, 'Búsqueda completada exitosamente', result);
            } else {
                // Búsqueda sin paginación
                const patients = await patientRepository.findAllActive(filters);
                return apiResponse.success(res, 'Búsqueda completada exitosamente', {
                    patients,
                    total: patients.length
                });
            }

        } catch (error) {
            console.error('Error en búsqueda de pacientes:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener estadísticas de pacientes
    async getPatientStats(req, res) {
        try {
            const stats = await patientRepository.getPatientStats();

            return apiResponse.success(res, 'Estadísticas obtenidas exitosamente', { stats });

        } catch (error) {
            console.error('Error al obtener estadísticas de pacientes:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Verificar disponibilidad de DNI
    async checkDniAvailability(req, res) {
        try {
            const { dni } = req.params;
            const { excludeId } = req.query;

            const exists = await patientRepository.checkPatientExists(dni, excludeId);

            return apiResponse.success(res, 'Verificación completada', {
                available: !exists,
                exists: exists
            });

        } catch (error) {
            console.error('Error al verificar disponibilidad de DNI:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new PatientController();