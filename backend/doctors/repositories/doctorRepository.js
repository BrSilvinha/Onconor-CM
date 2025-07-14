const { Doctor, User, Specialty } = require('../../shared/models');
const { Op } = require('sequelize');

class DoctorRepository {
    
    // Crear un nuevo médico
    async createDoctor(doctorData) {
        try {
            const doctor = await Doctor.create(doctorData);
            return doctor;
        } catch (error) {
            throw new Error(`Error al crear médico: ${error.message}`);
        }
    }

    // Buscar médico por ID
    async findById(id) {
        try {
            const doctor = await Doctor.findOne({
                where: { 
                    id: id,
                    flg_deleted: false
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: Specialty,
                        as: 'specialty'
                    }
                ]
            });
            return doctor;
        } catch (error) {
            throw new Error(`Error al buscar médico por ID: ${error.message}`);
        }
    }

    // Buscar médico por número de licencia médica
    async findByMedicalLicense(medicalLicense) {
        try {
            const doctor = await Doctor.findOne({
                where: { 
                    medicalLicense: medicalLicense,
                    flg_deleted: false,
                    active: true
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: Specialty,
                        as: 'specialty'
                    }
                ]
            });
            return doctor;
        } catch (error) {
            throw new Error(`Error al buscar médico por licencia: ${error.message}`);
        }
    }

    // Buscar médico por userId
    async findByUserId(userId) {
        try {
            const doctor = await Doctor.findOne({
                where: { 
                    userId: userId,
                    flg_deleted: false
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: Specialty,
                        as: 'specialty'
                    }
                ]
            });
            return doctor;
        } catch (error) {
            throw new Error(`Error al buscar médico por userId: ${error.message}`);
        }
    }

    // Buscar médicos por especialidad
    async findBySpecialty(specialtyId) {
        try {
            const doctors = await Doctor.findAll({
                where: { 
                    specialtyId: specialtyId,
                    flg_deleted: false,
                    active: true
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: Specialty,
                        as: 'specialty'
                    }
                ],
                order: [['lastName', 'ASC'], ['firstName', 'ASC']]
            });
            return doctors;
        } catch (error) {
            throw new Error(`Error al buscar médicos por especialidad: ${error.message}`);
        }
    }

    // Actualizar datos del médico
    async updateDoctor(doctorId, doctorData) {
        try {
            const [updatedRows] = await Doctor.update(
                doctorData,
                { 
                    where: { 
                        id: doctorId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al actualizar médico: ${error.message}`);
        }
    }

    // Desactivar médico (soft delete)
    async deactivateDoctor(doctorId, deletedBy) {
        try {
            const [updatedRows] = await Doctor.update(
                { 
                    active: false,
                    flg_deleted: true,
                    deleted_at: new Date(),
                    user_deleted: deletedBy
                },
                { 
                    where: { 
                        id: doctorId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al desactivar médico: ${error.message}`);
        }
    }

    // Activar médico
    async activateDoctor(doctorId) {
        try {
            const [updatedRows] = await Doctor.update(
                { 
                    active: true,
                    flg_deleted: false,
                    deleted_at: null
                },
                { 
                    where: { id: doctorId }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al activar médico: ${error.message}`);
        }
    }

    // Listar médicos activos con filtros
    async findAllActive(filters = {}) {
        try {
            const whereClause = {
                flg_deleted: false,
                active: true
            };

            // Aplicar filtros adicionales
            if (filters.search) {
                whereClause[Op.or] = [
                    { firstName: { [Op.like]: `%${filters.search}%` } },
                    { lastName: { [Op.like]: `%${filters.search}%` } },
                    { medicalLicense: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.specialtyId) {
                whereClause.specialtyId = filters.specialtyId;
            }

            const doctors = await Doctor.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: Specialty,
                        as: 'specialty'
                    }
                ],
                order: [['lastName', 'ASC'], ['firstName', 'ASC']]
            });
            
            return doctors;
        } catch (error) {
            throw new Error(`Error al listar médicos: ${error.message}`);
        }
    }

    // Buscar médicos con paginación
    async findWithPagination(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            
            const whereClause = {
                flg_deleted: false,
                active: true
            };

            // Aplicar filtros
            if (filters.search) {
                whereClause[Op.or] = [
                    { firstName: { [Op.like]: `%${filters.search}%` } },
                    { lastName: { [Op.like]: `%${filters.search}%` } },
                    { medicalLicense: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.specialtyId) {
                whereClause.specialtyId = filters.specialtyId;
            }

            const { count, rows } = await Doctor.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: Specialty,
                        as: 'specialty'
                    }
                ],
                order: [['lastName', 'ASC'], ['firstName', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                doctors: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error al buscar médicos con paginación: ${error.message}`);
        }
    }

    // Verificar si existe médico con licencia médica
    async checkDoctorExists(medicalLicense, excludeId = null) {
        try {
            const whereClause = {
                medicalLicense: medicalLicense,
                flg_deleted: false
            };

            if (excludeId) {
                whereClause.id = { [Op.ne]: excludeId };
            }

            const doctor = await Doctor.findOne({ where: whereClause });
            return doctor !== null;
        } catch (error) {
            throw new Error(`Error al verificar existencia de médico: ${error.message}`);
        }
    }

    // Cambiar especialidad del médico
    async changeSpecialty(doctorId, newSpecialtyId, updatedBy) {
        try {
            const [updatedRows] = await Doctor.update(
                { 
                    specialtyId: newSpecialtyId,
                    user_updated: updatedBy
                },
                { 
                    where: { 
                        id: doctorId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al cambiar especialidad del médico: ${error.message}`);
        }
    }

    // Obtener estadísticas de médicos
    async getDoctorStats() {
        try {
            const totalDoctors = await Doctor.count({
                where: { flg_deleted: false }
            });

            const activeDoctors = await Doctor.count({
                where: { 
                    flg_deleted: false,
                    active: true
                }
            });

            const doctorsBySpecialty = await Doctor.findAll({
                attributes: [
                    'specialtyId',
                    [Doctor.sequelize.fn('COUNT', Doctor.sequelize.col('Doctor.id')), 'count']
                ],
                where: { 
                    flg_deleted: false,
                    active: true
                },
                include: [{
                    model: Specialty,
                    as: 'specialty',
                    attributes: ['name']
                }],
                group: ['specialtyId', 'specialty.id']
            });

            return {
                total: totalDoctors,
                active: activeDoctors,
                inactive: totalDoctors - activeDoctors,
                bySpecialty: doctorsBySpecialty
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de médicos: ${error.message}`);
        }
    }
}

module.exports = new DoctorRepository();