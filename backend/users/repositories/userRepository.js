const User = require('../models/user');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

class UserRepository {
    
    // Crear un nuevo usuario
    async createUser(userData) {
        try {
            // Hashear la contraseña antes de guardar
            if (userData.password) {
                const saltRounds = 10;
                userData.password = await bcrypt.hash(userData.password, saltRounds);
            }

            const user = await User().create(userData);
            return user;
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    // Buscar usuario por email
    async findByEmail(email) {
        try {
            const user = await User().findOne({
                where: { 
                    email: email,
                    flg_deleted: 0,
                    active: true
                }
            });
            return user;
        } catch (error) {
            throw new Error(`Error al buscar usuario por email: ${error.message}`);
        }
    }

    // Buscar usuario por username
    async findByUsername(username) {
        try {
            const user = await User().findOne({
                where: { 
                    username: username,
                    flg_deleted: 0,
                    active: true
                }
            });
            return user;
        } catch (error) {
            throw new Error(`Error al buscar usuario por username: ${error.message}`);
        }
    }

    // Buscar usuario por ID
    async findById(id) {
        try {
            const user = await User().findOne({
                where: { 
                    id: id,
                    flg_deleted: 0
                }
            });
            return user;
        } catch (error) {
            throw new Error(`Error al buscar usuario por ID: ${error.message}`);
        }
    }

    // Buscar usuario por documento de persona
    async findByPersonDoc(person_num_doc) {
        try {
            const user = await User().findOne({
                where: { 
                    person_num_doc: person_num_doc,
                    flg_deleted: 0,
                    active: true
                }
            });
            return user;
        } catch (error) {
            throw new Error(`Error al buscar usuario por documento: ${error.message}`);
        }
    }

    // Verificar contraseña
    async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw new Error(`Error al verificar contraseña: ${error.message}`);
        }
    }

    // Actualizar contraseña
    async updatePassword(userId, newPassword) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            
            const [updatedRows] = await User().update(
                { password: hashedPassword },
                { 
                    where: { 
                        id: userId,
                        flg_deleted: 0
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al actualizar contraseña: ${error.message}`);
        }
    }

    // Actualizar datos del usuario
    async updateUser(userId, userData) {
        try {
            // Si hay contraseña, hashearla
            if (userData.password) {
                const saltRounds = 10;
                userData.password = await bcrypt.hash(userData.password, saltRounds);
            }

            const [updatedRows] = await User().update(
                userData,
                { 
                    where: { 
                        id: userId,
                        flg_deleted: 0
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }

    // Desactivar usuario (soft delete)
    async deactivateUser(userId, deletedBy) {
        try {
            const [updatedRows] = await User().update(
                { 
                    active: false,
                    flg_deleted: 1,
                    deleted_at: new Date(),
                    user_deleted: deletedBy
                },
                { 
                    where: { 
                        id: userId,
                        flg_deleted: 0
                    }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al desactivar usuario: ${error.message}`);
        }
    }

    // Activar usuario
    async activateUser(userId) {
        try {
            const [updatedRows] = await User().update(
                { 
                    active: true,
                    flg_deleted: 0,
                    deleted_at: null
                },
                { 
                    where: { id: userId }
                }
            );
            
            return updatedRows > 0;
        } catch (error) {
            throw new Error(`Error al activar usuario: ${error.message}`);
        }
    }

    // Listar usuarios activos por establecimiento
    async findByEstablishment(establishmentId) {
        try {
            const users = await User().findAll({
                where: { 
                    establishment_id: establishmentId,
                    flg_deleted: 0,
                    active: true
                },
                attributes: { exclude: ['password'] } // Excluir contraseña de la respuesta
            });
            return users;
        } catch (error) {
            throw new Error(`Error al buscar usuarios por establecimiento: ${error.message}`);
        }
    }

    // Verificar si existe usuario con email o username
    async checkUserExists(email, username, excludeId = null) {
        try {
            const whereClause = {
                flg_deleted: 0,
                [Op.or]: []
            };

            if (email) {
                whereClause[Op.or].push({ email: email });
            }
            if (username) {
                whereClause[Op.or].push({ username: username });
            }

            if (excludeId) {
                whereClause.id = { [Op.ne]: excludeId };
            }

            const user = await User().findOne({ where: whereClause });
            return user !== null;
        } catch (error) {
            throw new Error(`Error al verificar existencia de usuario: ${error.message}`);
        }
    }
}

module.exports = new UserRepository();
