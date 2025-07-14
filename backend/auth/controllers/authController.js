const jwt = require('jsonwebtoken');
const userRepository = require('../../users/repositories/userRepository');

class AuthController {
    
    // Login de usuario
    async login(req, res) {
        try {
            const { identifier, password } = req.body;

            // Validar datos requeridos
            if (!identifier || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email/username y contraseña son requeridos'
                });
            }

            // Buscar usuario por email o username
            let user = await userRepository.findByEmail(identifier);
            if (!user) {
                user = await userRepository.findByUsername(identifier);
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar contraseña
            const isValidPassword = await userRepository.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar JWT token
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email,
                    username: user.username,
                    establishmentId: user.establishment_id
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );

            // Respuesta exitosa sin incluir la contraseña
            const { password: _, ...userWithoutPassword } = user.toJSON();
            
            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    user: userWithoutPassword,
                    token: token
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Registro de usuario
    async register(req, res) {
        try {
            const { 
                establishment_id, 
                person_num_doc, 
                email, 
                username, 
                password,
                user_created 
            } = req.body;

            // Validar datos requeridos
            if (!establishment_id || !person_num_doc || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Establecimiento, documento de persona y contraseña son requeridos'
                });
            }

            if (!email && !username) {
                return res.status(400).json({
                    success: false,
                    message: 'Email o username son requeridos'
                });
            }

            // Verificar si ya existe un usuario con el mismo email o username
            if (email) {
                const existingUserByEmail = await userRepository.findByEmail(email);
                if (existingUserByEmail) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe un usuario con este email'
                    });
                }
            }

            if (username) {
                const existingUserByUsername = await userRepository.findByUsername(username);
                if (existingUserByUsername) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe un usuario con este username'
                    });
                }
            }

            // Verificar si ya existe un usuario con el mismo documento
            const existingUserByDoc = await userRepository.findByPersonDoc(person_num_doc);
            if (existingUserByDoc) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un usuario con este documento'
                });
            }

            // Crear usuario
            const userData = {
                establishment_id,
                person_num_doc,
                email,
                username,
                password,
                active: true,
                flg_deleted: 0,
                user_created
            };

            const newUser = await userRepository.createUser(userData);

            // Respuesta exitosa sin incluir la contraseña
            const { password: _, ...userWithoutPassword } = newUser.toJSON();

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: userWithoutPassword
                }
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Logout (invalidar token - esto se maneja típicamente en el frontend)
    async logout(req, res) {
        try {
            // En una implementación más compleja, podrías mantener una blacklist de tokens
            res.json({
                success: true,
                message: 'Logout exitoso'
            });
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Refrescar token
    async refreshToken(req, res) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token requerido'
                });
            }

            // Verificar token actual
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Buscar usuario para verificar que aún esté activo
            const user = await userRepository.findById(decoded.userId);
            if (!user || !user.active) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no válido'
                });
            }

            // Generar nuevo token
            const newToken = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email,
                    username: user.username,
                    establishmentId: user.establishment_id
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );

            res.json({
                success: true,
                message: 'Token renovado exitosamente',
                data: {
                    token: newToken
                }
            });

        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }

            console.error('Error al refrescar token:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Cambiar contraseña
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId; // Viene del middleware de autenticación

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva contraseña son requeridas'
                });
            }

            // Buscar usuario
            const user = await userRepository.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar contraseña actual
            const isValidPassword = await userRepository.verifyPassword(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }

            // Actualizar contraseña
            const updated = await userRepository.updatePassword(userId, newPassword);
            if (!updated) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar contraseña'
                });
            }

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });

        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener perfil del usuario autenticado
    async getProfile(req, res) {
        try {
            const userId = req.user.userId; // Viene del middleware de autenticación

            const user = await userRepository.findById(userId);
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
                message: 'Perfil obtenido exitosamente',
                data: {
                    user: userWithoutPassword
                }
            });

        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = new AuthController();
