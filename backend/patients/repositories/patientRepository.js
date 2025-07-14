const { Patient, User } = require('../../shared/models');
const { Op } = require('sequelize');

class PatientRepository {
    
    // Crear un nuevo paciente
    async createPatient(patientData) {
        try {
            const patient = await Patient.create(patientData);
            return patient;
        } catch (error) {
            throw new Error(`Error al crear paciente: ${error.message}`);
        }
    }

    // Buscar paciente por ID
    async findById(id) {
        try {
            const patient = await Patient.findOne({
                where: { 
                    id: id,
                    flg_deleted: false
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }]
            });
            return patient;
        } catch (error) {
            throw new Error(`Error al buscar paciente por ID: ${error.message}`);
        }
    }

    // Buscar paciente por DNI
    async findByDni(dni) {
        try {
            const patient = await Patient.findOne({
                where: { 
                    dni: dni,
                    flg_deleted: false,
                    active: true
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }]
            });
            return patient;
        } catch (error) {
            throw new Error(`Error al buscar paciente por DNI: ${error.message}`);
        }
    }

    // Buscar paciente por userId
    async findByUserId(userId) {
        try {
            const patient = await Patient.findOne({
                where: { 
                    userId: userId,
                    flg_deleted: false
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }]
            });
            return patient;
        } catch (error) {
            throw new Error(`Error al buscar paciente por userId: ${error.message}`);
        }
    }

    // Actualizar datos del paciente
    async updatePatient(patientId, patientData) {
        try {
            const [updatedRows] = await Patient.update(
                patientData,
                { 
                    where: { 
                        id: patientId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al actualizar paciente: ${error.message}`);
        }
    }

    // Desactivar paciente (soft delete)
    async deactivatePatient(patientId, deletedBy) {
        try {
            const [updatedRows] = await Patient.update(
                { 
                    active: false,
                    flg_deleted: true,
                    deleted_at: new Date(),
                    user_deleted: deletedBy
                },
                { 
                    where: { 
                        id: patientId,
                        flg_deleted: false
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al desactivar paciente: ${error.message}`);
        }
    }

    // Activar paciente
    async activatePatient(patientId) {
        try {
            const [updatedRows] = await Patient.update(
                { 
                    active: true,
                    flg_deleted: false,
                    deleted_at: null
                },
                { 
                    where: { id: patientId }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al activar paciente: ${error.message}`);
        }
    }

    // Listar pacientes activos con filtros
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
                    { dni: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.gender) {
                whereClause.gender = filters.gender;
            }

            const patients = await Patient.findAll({
                where: whereClause,
                include: [{
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }],
                order: [['lastName', 'ASC'], ['firstName', 'ASC']]
            });
            
            return patients;
        } catch (error) {
            throw new Error(`Error al listar pacientes: ${error.message}`);
        }
    }

    // Buscar pacientes con paginación
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
                    { dni: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            if (filters.gender) {
                whereClause.gender = filters.gender;
            }

            const { count, rows } = await Patient.findAndCountAll({
                where: whereClause,
                include: [{
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }],
                order: [['lastName', 'ASC'], ['firstName', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                patients: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error al buscar pacientes con paginación: ${error.message}`);
        }
    }

    // Verificar si existe paciente con DNI
    async checkPatientExists(dni, excludeId = null) {
        try {
            const whereClause = {
                dni: dni,
                flg_deleted: false
            };

            if (excludeId) {
                whereClause.id = { [Op.ne]: excludeId };
            }

            const patient = await Patient.findOne({ where: whereClause });
            return patient !== null;
        } catch (error) {
            throw new Error(`Error al verificar existencia de paciente: ${error.message}`);
        }
    }

    // Obtener estadísticas de pacientes
    async getPatientStats() {
        try {
            const totalPatients = await Patient.count({
                where: { flg_deleted: false }
            });

            const activePatients = await Patient.count({
                where: { 
                    flg_deleted: false,
                    active: true
                }
            });

            const patientsByGender = await Patient.findAll({
                attributes: [
                    'gender',
                    [Patient.sequelize.fn('COUNT', Patient.sequelize.col('id')), 'count']
                ],
                where: { 
                    flg_deleted: false,
                    active: true
                },
                group: ['gender']
            });

            return {
                total: totalPatients,
                active: activePatients,
                inactive: totalPatients - activePatients,
                byGender: patientsByGender
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de pacientes: ${error.message}`);
        }
    }
}

module.exports = new PatientRepository();