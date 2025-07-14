const doctorRepository = require('../repositories/doctorRepository');
const specialtyRepository = require('../../specialties/repositories/specialtyRepository');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class DoctorController {
    
    // Crear nuevo médico
    async createDoctor(req, res) {
        try {
            const doctorData = req.body;

            // Verificar que no existe un médico con la misma licencia médica
            const existingDoctor = await doctorRepository.findByMedicalLicense(doctorData.medicalLicense);
            if (existingDoctor) {
                return apiResponse.conflict(res, 'Ya existe un médico con esta licencia médica');
            }

            // Verificar que la especialidad existe
            const specialty = await specialtyRepository.findById(doctorData.specialtyId);
            if (!specialty) {
                return apiResponse.notFound(res, 'La especialidad especificada no existe');
            }

            if (!specialty.isActive) {
                return apiResponse.badRequest(res, 'La especialidad especificada no está activa');
            }

            // Agregar información de auditoría
            doctorData.user_created = req.user.userId;

            const doctor = await doctorRepository.createDoctor(doctorData);

            return apiResponse.success(res, 'Médico creado exitosamente', { doctor });

        } catch (error) {
            console.error('Error al crear médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener médico por ID
    async getDoctorById(req, res) {
        try {
            const { id } = req.params;

            const doctor = await doctorRepository.findById(id);
            if (!doctor) {
                return apiResponse.notFound(res, 'Médico no encontrado');
            }

            return apiResponse.success(res, 'Médico obtenido exitosamente', { doctor });

        } catch (error) {
            console.error('Error al obtener médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener médico por licencia médica
    async getDoctorByLicense(req, res) {
        try {
            const { license } = req.params;

            const doctor = await doctorRepository.findByMedicalLicense(license);
            if (!doctor) {
                return apiResponse.notFound(res, 'Médico no encontrado');
            }

            return apiResponse.success(res, 'Médico obtenido exitosamente', { doctor });

        } catch (error) {
            console.error('Error al obtener médico por licencia:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener médicos por especialidad
    async getDoctorsBySpecialty(req, res) {
        try {
            const { specialtyId } = req.params;

            // Verificar que la especialidad existe
            const specialty = await specialtyRepository.findById(specialtyId);
            if (!specialty) {
                return apiResponse.notFound(res, 'Especialidad no encontrada');
            }

            const doctors = await doctorRepository.findBySpecialty(specialtyId);

            return apiResponse.success(res, 'Médicos obtenidos exitosamente', { 
                doctors,
                specialty,
                total: doctors.length 
            });

        } catch (error) {
            console.error('Error al obtener médicos por especialidad:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Actualizar médico
    async updateDoctor(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validar que el médico existe
            const existingDoctor = await doctorRepository.findById(id);
            if (!existingDoctor) {
                return apiResponse.notFound(res, 'Médico no encontrado');
            }

            // Verificar si hay conflicto con licencia médica
            if (updateData.medicalLicense) {
                const doctorWithLicense = await doctorRepository.findByMedicalLicense(updateData.medicalLicense);
                if (doctorWithLicense && doctorWithLicense.id !== parseInt(id)) {
                    return apiResponse.conflict(res, 'Ya existe un médico con esta licencia médica');
                }
            }

            // Verificar especialidad si se está actualizando
            if (updateData.specialtyId) {
                const specialty = await specialtyRepository.findById(updateData.specialtyId);
                if (!specialty) {
                    return apiResponse.notFound(res, 'La especialidad especificada no existe');
                }
                if (!specialty.isActive) {
                    return apiResponse.badRequest(res, 'La especialidad especificada no está activa');
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

            const updated = await doctorRepository.updateDoctor(id, updateData);
            if (!updated) {
                return apiResponse.error(res, 'Error al actualizar médico');
            }

            // Obtener el médico actualizado
            const updatedDoctor = await doctorRepository.findById(id);

            return apiResponse.success(res, 'Médico actualizado exitosamente', { doctor: updatedDoctor });

        } catch (error) {
            console.error('Error al actualizar médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar médicos activos
    async getActiveDoctors(req, res) {
        try {
            const filters = {
                search: req.query.search,
                specialtyId: req.query.specialtyId
            };

            const doctors = await doctorRepository.findAllActive(filters);

            return apiResponse.success(res, 'Médicos obtenidos exitosamente', { 
                doctors,
                total: doctors.length 
            });

        } catch (error) {
            console.error('Error al obtener médicos activos:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar médicos con paginación
    async getDoctorsWithPagination(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                search: req.query.search,
                specialtyId: req.query.specialtyId
            };

            const result = await doctorRepository.findWithPagination(page, limit, filters);

            return apiResponse.success(res, 'Médicos obtenidos exitosamente', result);

        } catch (error) {
            console.error('Error al obtener médicos con paginación:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Cambiar especialidad del médico
    async changeSpecialty(req, res) {
        try {
            const { id } = req.params;
            const { specialtyId } = req.body;

            // Verificar que el médico existe
            const doctor = await doctorRepository.findById(id);
            if (!doctor) {
                return apiResponse.notFound(res, 'Médico no encontrado');
            }

            // Verificar que la nueva especialidad existe y está activa
            const specialty = await specialtyRepository.findById(specialtyId);
            if (!specialty) {
                return apiResponse.notFound(res, 'La especialidad especificada no existe');
            }
            if (!specialty.isActive) {
                return apiResponse.badRequest(res, 'La especialidad especificada no está activa');
            }

            const updated = await doctorRepository.changeSpecialty(id, specialtyId, req.user.userId);
            if (!updated) {
                return apiResponse.error(res, 'Error al cambiar especialidad del médico');
            }

            // Obtener el médico actualizado
            const updatedDoctor = await doctorRepository.findById(id);

            return apiResponse.success(res, 'Especialidad del médico actualizada exitosamente', { 
                doctor: updatedDoctor 
            });

        } catch (error) {
            console.error('Error al cambiar especialidad del médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Desactivar médico (soft delete)
    async deactivateDoctor(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el médico existe
            const doctor = await doctorRepository.findById(id);
            if (!doctor) {
                return apiResponse.notFound(res, 'Médico no encontrado');
            }

            const deactivated = await doctorRepository.deactivateDoctor(id, req.user.userId);
            if (!deactivated) {
                return apiResponse.error(res, 'Error al desactivar médico');
            }

            return apiResponse.success(res, 'Médico desactivado exitosamente');

        } catch (error) {
            console.error('Error al desactivar médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Activar médico
    async activateDoctor(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el médico existe
            const doctor = await doctorRepository.findById(id);
            if (!doctor) {
                return apiResponse.notFound(res, 'Médico no encontrado');
            }

            const activated = await doctorRepository.activateDoctor(id);
            if (!activated) {
                return apiResponse.error(res, 'Error al activar médico');
            }

            return apiResponse.success(res, 'Médico activado exitosamente');

        } catch (error) {
            console.error('Error al activar médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Buscar médicos
    async searchDoctors(req, res) {
        try {
            const { search, specialtyId, page = 1, limit = 10 } = req.query;

            const filters = {};
            if (search) filters.search = search;
            if (specialtyId) filters.specialtyId = specialtyId;

            if (page && limit) {
                // Búsqueda con paginación
                const result = await doctorRepository.findWithPagination(
                    parseInt(page), 
                    parseInt(limit), 
                    filters
                );
                return apiResponse.success(res, 'Búsqueda completada exitosamente', result);
            } else {
                // Búsqueda sin paginación
                const doctors = await doctorRepository.findAllActive(filters);
                return apiResponse.success(res, 'Búsqueda completada exitosamente', {
                    doctors,
                    total: doctors.length
                });
            }

        } catch (error) {
            console.error('Error en búsqueda de médicos:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener estadísticas de médicos
    async getDoctorStats(req, res) {
        try {
            const stats = await doctorRepository.getDoctorStats();

            return apiResponse.success(res, 'Estadísticas obtenidas exitosamente', { stats });

        } catch (error) {
            console.error('Error al obtener estadísticas de médicos:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Verificar disponibilidad de licencia médica
    async checkLicenseAvailability(req, res) {
        try {
            const { license } = req.params;
            const { excludeId } = req.query;

            const exists = await doctorRepository.checkDoctorExists(license, excludeId);

            return apiResponse.success(res, 'Verificación completada', {
                available: !exists,
                exists: exists
            });

        } catch (error) {
            console.error('Error al verificar disponibilidad de licencia:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new DoctorController();