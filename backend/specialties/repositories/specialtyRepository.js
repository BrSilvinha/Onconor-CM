const { Specialty, Doctor } = require('../../shared/models');
const { Op } = require('sequelize');

class SpecialtyRepository {
    
    // Crear una nueva especialidad
    async createSpecialty(specialtyData) {
        try {
            const specialty = await Specialty.create(specialtyData);
            return specialty;
        } catch (error) {
            throw new Error(`Error al crear especialidad: ${error.message}`);
        }
    }

    // Buscar especialidad por ID
    async findById(id) {
        try {
            const specialty = await Specialty.findOne({
                where: { 
                    id: id,
                    flg_deleted: false
                }
            });
            return specialty;
        } catch (error) {
            throw new Error(`Error al buscar especialidad por ID: ${error.message}`);
        }
    }

    // Buscar especialidad por nombre
    async findByName(name) {
        try {
            const specialty = await Specialty.findOne({
                where: { 
                    name: name,
                    flg_deleted: false
                }
            });
            return specialty;
        } catch (error) {
            throw new Error(`Error al buscar especialidad por nombre: ${error.message}`);
        }
    }

    // Actualizar datos de la especialidad
    async updateSpecialty(specialtyId, specialtyData) {
        try {
            const [updatedRows] = await Specialty.update(
                specialtyData,
                { 
                    where: { 
                        id: specialtyId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al actualizar especialidad: ${error.message}`);
        }
    }

    // Desactivar especialidad (soft delete)
    async deactivateSpecialty(specialtyId, deletedBy) {
        try {
            // Verificar si hay médicos asociados
            const doctorsCount = await Doctor.count({
                where: {
                    specialtyId: specialtyId,
                    flg_deleted: false,
                    active: true
                }
            });

            if (doctorsCount > 0) {
                throw new Error(`No se puede desactivar la especialidad. Hay ${doctorsCount} médicos asociados`);
            }

            const [updatedRows] = await Specialty.update(
                { 
                    isActive: false,
                    flg_deleted: true,
                    deleted_at: new Date(),
                    user_deleted: deletedBy
                },
                { 
                    where: { 
                        id: specialtyId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al desactivar especialidad: ${error.message}`);
        }
    }

    // Activar especialidad
    async activateSpecialty(specialtyId) {
        try {
            const [updatedRows] = await Specialty.update(
                { 
                    isActive: true,
                    flg_deleted: false,
                    deleted_at: null
                },
                { 
                    where: { id: specialtyId }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al activar especialidad: ${error.message}`);
        }
    }

    // Listar especialidades activas
    async findAllActive(filters = {}) {
        try {
            const whereClause = {
                flg_deleted: false,
                isActive: true
            };

            // Aplicar filtros adicionales
            if (filters.search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${filters.search}%` } },
                    { description: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            const specialties = await Specialty.findAll({
                where: whereClause,
                order: [['name', 'ASC']]
            });
            
            return specialties;
        } catch (error) {
            throw new Error(`Error al listar especialidades: ${error.message}`);
        }
    }

    // Listar todas las especialidades (incluyendo inactivas)
    async findAll(filters = {}) {
        try {
            const whereClause = {
                flg_deleted: false
            };

            // Aplicar filtros adicionales
            if (filters.search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${filters.search}%` } },
                    { description: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.isActive !== undefined) {
                whereClause.isActive = filters.isActive;
            }

            const specialties = await Specialty.findAll({
                where: whereClause,
                order: [['name', 'ASC']]
            });
            
            return specialties;
        } catch (error) {
            throw new Error(`Error al listar todas las especialidades: ${error.message}`);
        }
    }

    // Buscar especialidades con paginación
    async findWithPagination(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            
            const whereClause = {
                flg_deleted: false
            };

            // Aplicar filtros
            if (filters.search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${filters.search}%` } },
                    { description: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.isActive !== undefined) {
                whereClause.isActive = filters.isActive;
            }

            const { count, rows } = await Specialty.findAndCountAll({
                where: whereClause,
                order: [['name', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                specialties: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error al buscar especialidades con paginación: ${error.message}`);
        }
    }

    // Verificar si existe especialidad con nombre
    async checkSpecialtyExists(name, excludeId = null) {
        try {
            const whereClause = {
                name: name,
                flg_deleted: false
            };

            if (excludeId) {
                whereClause.id = { [Op.ne]: excludeId };
            }

            const specialty = await Specialty.findOne({ where: whereClause });
            return specialty !== null;
        } catch (error) {
            throw new Error(`Error al verificar existencia de especialidad: ${error.message}`);
        }
    }

    // Obtener especialidad con médicos asociados
    async findWithDoctors(specialtyId) {
        try {
            const specialty = await Specialty.findOne({
                where: { 
                    id: specialtyId,
                    flg_deleted: false
                },
                include: [{
                    model: Doctor,
                    as: 'doctors',
                    where: {
                        flg_deleted: false,
                        active: true
                    },
                    required: false
                }]
            });
            return specialty;
        } catch (error) {
            throw new Error(`Error al buscar especialidad con médicos: ${error.message}`);
        }
    }

    // Obtener estadísticas de especialidades
    async getSpecialtyStats() {
        try {
            const totalSpecialties = await Specialty.count({
                where: { flg_deleted: false }
            });

            const activeSpecialties = await Specialty.count({
                where: { 
                    flg_deleted: false,
                    isActive: true
                }
            });

            const specialtiesWithDoctors = await Specialty.findAll({
                attributes: [
                    'id',
                    'name',
                    [Specialty.sequelize.fn('COUNT', Specialty.sequelize.col('doctors.id')), 'doctorCount']
                ],
                include: [{
                    model: Doctor,
                    as: 'doctors',
                    where: {
                        flg_deleted: false,
                        active: true
                    },
                    attributes: [],
                    required: false
                }],
                where: { 
                    flg_deleted: false,
                    isActive: true
                },
                group: ['Specialty.id']
            });

            return {
                total: totalSpecialties,
                active: activeSpecialties,
                inactive: totalSpecialties - activeSpecialties,
                withDoctors: specialtiesWithDoctors
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de especialidades: ${error.message}`);
        }
    }
}

module.exports = new SpecialtyRepository();