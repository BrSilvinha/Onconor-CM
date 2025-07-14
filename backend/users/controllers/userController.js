const userRepository = require('../repositories/userRepository');

class UserController {
    
    // Obtener usuario por ID
    async getUserById(req, res) {
        try {
            const { id } = req.params;

            const user = await userRepository.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Respuesta sin incluir la contraseña
            const { password: _, ...userWithoutPassword } = user.toJSON();

            res.json({
                success: true,
                message: 'Usuario obtenido exitosamente',
                data: {
                    user: userWithoutPassword
                }
            });

        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar usuario
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validar que el usuario existe
            const existingUser = await userRepository.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar si hay conflictos con email o username
            if (updateData.email) {
                const userWithEmail = await userRepository.findByEmail(updateData.email);
                if (userWithEmail && userWithEmail.id !== parseInt(id)) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe un usuario con este email'
                    });
                }
            }

            if (updateData.username) {
                const userWithUsername = await userRepository.findByUsername(updateData.username);
                if (userWithUsername && userWithUsername.id !== parseInt(id)) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe un usuario con este username'
                    });
                }
            }

            // Agregar información de quién actualiza
            updateData.user_updated = req.user.userId;

            // No permitir actualizar ciertos campos sensibles
            delete updateData.id;
            delete updateData.created_at;
            delete updateData.updated_at;
            delete updateData.flg_deleted;
            delete updateData.deleted_at;

            const updated = await userRepository.updateUser(id, updateData);
            if (!updated) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar usuario'
                });
            }

            // Obtener el usuario actualizado
            const updatedUser = await userRepository.findById(id);
            const { password: _, ...userWithoutPassword } = updatedUser.toJSON();

            res.json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                data: {
                    user: userWithoutPassword
                }
            });

        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener usuarios por establecimiento
    async getUsersByEstablishment(req, res) {
        try {
            const { establishmentId } = req.params;
            
            // Verificar que el usuario tiene acceso a este establecimiento
            if (req.user.establishmentId !== parseInt(establishmentId)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a usuarios de este establecimiento'
                });
            }

            const users = await userRepository.findByEstablishment(establishmentId);

            res.json({
                success: true,
                message: 'Usuarios obtenidos exitosamente',
                data: {
                    users: users
                }
            });

        } catch (error) {
            console.error('Error al obtener usuarios por establecimiento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Desactivar usuario (soft delete)
    async deactivateUser(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el usuario existe
            const user = await userRepository.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // No permitir que un usuario se desactive a sí mismo
            if (parseInt(id) === req.user.userId) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes desactivar tu propia cuenta'
                });
            }

            // Verificar que pertenece al mismo establecimiento
            if (user.establishment_id !== req.user.establishmentId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para desactivar este usuario'
                });
            }

            const deactivated = await userRepository.deactivateUser(id, req.user.userId);
            if (!deactivated) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al desactivar usuario'
                });
            }

            res.json({
                success: true,
                message: 'Usuario desactivado exitosamente'
            });

        } catch (error) {
            console.error('Error al desactivar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Activar usuario
    async activateUser(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el usuario existe
            const user = await userRepository.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar que pertenece al mismo establecimiento
            if (user.establishment_id !== req.user.establishmentId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para activar este usuario'
                });
            }

            const activated = await userRepository.activateUser(id);
            if (!activated) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al activar usuario'
                });
            }

            res.json({
                success: true,
                message: 'Usuario activado exitosamente'
            });

        } catch (error) {
            console.error('Error al activar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Buscar usuarios (funcionalidad adicional)
    async searchUsers(req, res) {
        try {
            const { query, establishmentId } = req.query;

            // Verificar permisos de establecimiento
            if (establishmentId && req.user.establishmentId !== parseInt(establishmentId)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para buscar en este establecimiento'
                });
            }

            // Esta funcionalidad requeriría métodos adicionales en el repository
            // Por ahora, devolvemos los usuarios del establecimiento
            const users = await userRepository.findByEstablishment(
                establishmentId || req.user.establishmentId
            );

            // Filtrar por query si se proporciona
            let filteredUsers = users;
            if (query) {
                const searchTerm = query.toLowerCase();
                filteredUsers = users.filter(user => 
                    (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                    (user.username && user.username.toLowerCase().includes(searchTerm)) ||
                    (user.person_num_doc && user.person_num_doc.includes(searchTerm))
                );
            }

            res.json({
                success: true,
                message: 'Búsqueda completada exitosamente',
                data: {
                    users: filteredUsers
                }
            });

        } catch (error) {
            console.error('Error en búsqueda de usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = new UserController();
