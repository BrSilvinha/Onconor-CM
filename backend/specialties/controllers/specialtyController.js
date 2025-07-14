const specialtyRepository = require('../repositories/specialtyRepository');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class SpecialtyController {
    
    // Crear nueva especialidad
    async createSpecialty(req, res) {
        try {
            const specialtyData = req.body;

            // Verificar que no existe una especialidad con el mismo nombre
            const existingSpecialty = await specialtyRepository.findByName(specialtyData.name);
            if (existingSpecialty) {
                return apiResponse.conflict(res, 'Ya existe una especialidad con este nombre');
            }

            // Agregar información de auditoría
            specialtyData.user_created = req.user.userId;

            const specialty = await specialtyRepository.createSpecialty(specialtyData);

            return apiResponse.success(res, 'Especialidad creada exitosamente', { specialty });

        } catch (error) {
            console.error('Error al crear especialidad:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener especialidad por ID
    async getSpecialtyById(req, res) {
        try {
            const { id } = req.params;

            const specialty = await specialtyRepository.findById(id);
            if (!specialty) {
                return apiResponse.notFound(res, 'Especialidad no encontrada');
            }

            return apiResponse.success(res, 'Especialidad obtenida exitosamente', { specialty });

        } catch (error) {
            console.error('Error al obtener especialidad:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener especialidad con médicos asociados
    async getSpecialtyWithDoctors(req, res) {
        try {
            const { id } = req.params;

            const specialty = await specialtyRepository.findWithDoctors(id);
            if (!specialty) {
                return apiResponse.notFound(res, 'Especialidad no encontrada');
            }

            return apiResponse.success(res, 'Especialidad obtenida exitosamente', { specialty });

        } catch (error) {
            console.error('Error al obtener especialidad con médicos:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Actualizar especialidad
    async updateSpecialty(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validar que la especialidad existe
            const existingSpecialty = await specialtyRepository.findById(id);
            if (!existingSpecialty) {
                return apiResponse.notFound(res, 'Especialidad no encontrada');
            }

            // Verificar si hay conflicto con el nombre
            if (updateData.name) {
                const specialtyWithName = await specialtyRepository.findByName(updateData.name);
                if (specialtyWithName && specialtyWithName.id !== parseInt(id)) {
                    return apiResponse.conflict(res, 'Ya existe una especialidad con este nombre');
                }
            }

            // Agregar información de auditoría
            updateData.user_updated = req.user.userId;

            // No permitir actualizar ciertos campos sensibles
            delete updateData.id;
            delete updateData.created_at;
            delete updateData.updated_at;
            delete updateData.flg_deleted;
            delete updateData.deleted_at;

            const updated = await specialtyRepository.updateSpecialty(id, updateData);
            if (!updated) {
                return apiResponse.error(res, 'Error al actualizar especialidad');
            }

            // Obtener la especialidad actualizada
            const updatedSpecialty = await specialtyRepository.findById(id);

            return apiResponse.success(res, 'Especialidad actualizada exitosamente', { 
                specialty: updatedSpecialty 
            });

        } catch (error) {
            console.error('Error al actualizar especialidad:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar especialidades activas
    async getActiveSpecialties(req, res) {
        try {
            const filters = {
                search: req.query.search
            };

            const specialties = await specialtyRepository.findAllActive(filters);

            return apiResponse.success(res, 'Especialidades obtenidas exitosamente', { 
                specialties,
                total: specialties.length 
            });

        } catch (error) {
            console.error('Error al obtener especialidades activas:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar todas las especialidades (incluyendo inactivas)
    async getAllSpecialties(req, res) {
        try {
            const filters = {
                search: req.query.search,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
            };

            const specialties = await specialtyRepository.findAll(filters);

            return apiResponse.success(res, 'Especialidades obtenidas exitosamente', { 
                specialties,
                total: specialties.length 
            });

        } catch (error) {
            console.error('Error al obtener todas las especialidades:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Listar especialidades con paginación
    async getSpecialtiesWithPagination(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                search: req.query.search,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
            };

            const result = await specialtyRepository.findWithPagination(page, limit, filters);

            return apiResponse.success(res, 'Especialidades obtenidas exitosamente', result);

        } catch (error) {
            console.error('Error al obtener especialidades con paginación:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Desactivar especialidad (soft delete)
    async deactivateSpecialty(req, res) {
        try {
            const { id } = req.params;

            // Verificar que la especialidad existe
            const specialty = await specialtyRepository.findById(id);
            if (!specialty) {
                return apiResponse.notFound(res, 'Especialidad no encontrada');
            }

            const deactivated = await specialtyRepository.deactivateSpecialty(id, req.user.userId);
            if (!deactivated) {
                return apiResponse.error(res, 'Error al desactivar especialidad');
            }

            return apiResponse.success(res, 'Especialidad desactivada exitosamente');

        } catch (error) {
            console.error('Error al desactivar especialidad:', error);
            if (error.message.includes('médicos asociados')) {
                return apiResponse.badRequest(res, error.message);
            }
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Activar especialidad
    async activateSpecialty(req, res) {
        try {
            const { id } = req.params;

            // Verificar que la especialidad existe
            const specialty = await specialtyRepository.findById(id);
            if (!specialty) {
                return apiResponse.notFound(res, 'Especialidad no encontrada');
            }

            const activated = await specialtyRepository.activateSpecialty(id);
            if (!activated) {
                return apiResponse.error(res, 'Error al activar especialidad');
            }

            return apiResponse.success(res, 'Especialidad activada exitosamente');

        } catch (error) {
            console.error('Error al activar especialidad:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Buscar especialidades
    async searchSpecialties(req, res) {
        try {
            const { search, isActive, page = 1, limit = 10 } = req.query;

            const filters = {};
            if (search) filters.search = search;
            if (isActive !== undefined) filters.isActive = isActive === 'true';

            if (page && limit) {
                // Búsqueda con paginación
                const result = await specialtyRepository.findWithPagination(
                    parseInt(page), 
                    parseInt(limit), 
                    filters
                );
                return apiResponse.success(res, 'Búsqueda completada exitosamente', result);
            } else {
                // Búsqueda sin paginación
                const specialties = filters.isActive !== undefined ? 
                    await specialtyRepository.findAll(filters) :
                    await specialtyRepository.findAllActive(filters);
                
                return apiResponse.success(res, 'Búsqueda completada exitosamente', {
                    specialties,
                    total: specialties.length
                });
            }

        } catch (error) {
            console.error('Error en búsqueda de especialidades:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Obtener estadísticas de especialidades
    async getSpecialtyStats(req, res) {
        try {
            const stats = await specialtyRepository.getSpecialtyStats();

            return apiResponse.success(res, 'Estadísticas obtenidas exitosamente', { stats });

        } catch (error) {
            console.error('Error al obtener estadísticas de especialidades:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    // Verificar disponibilidad de nombre
    async checkNameAvailability(req, res) {
        try {
            const { name } = req.params;
            const { excludeId } = req.query;

            const exists = await specialtyRepository.checkSpecialtyExists(name, excludeId);

            return apiResponse.success(res, 'Verificación completada', {
                available: !exists,
                exists: exists
            });

        } catch (error) {
            console.error('Error al verificar disponibilidad de nombre:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new SpecialtyController();