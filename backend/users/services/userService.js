const userRepository = require('../repositories/userRepository');
const patientRepository = require('../../patients/repositories/patientRepository');
const doctorRepository = require('../../doctors/repositories/doctorRepository');

class UserService {

    // Validar datos del usuario
    validateUserData(userData) {
        const errors = [];

        // Validar email
        if (userData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                errors.push('El formato del email no es válido');
            }
        }

        // Validar username
        if (userData.username) {
            if (userData.username.length < 3 || userData.username.length > 50) {
                errors.push('El username debe tener entre 3 y 50 caracteres');
            }
            if (!/^[a-zA-Z0-9_\-\.]+$/.test(userData.username)) {
                errors.push('El username solo puede contener letras, números, guiones, puntos y guiones bajos');
            }
        }

        // Validar documento de persona
        if (userData.person_num_doc) {
            if (!/^\d{8}$/.test(userData.person_num_doc)) {
                errors.push('El número de documento debe tener exactamente 8 dígitos');
            }
        }

        // Validar contraseña (si se está creando o actualizando)
        if (userData.password) {
            if (userData.password.length < 6) {
                errors.push('La contraseña debe tener al menos 6 caracteres');
            }
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
                errors.push('La contraseña debe contener al menos una minúscula, una mayúscula y un número');
            }
        }

        return errors;
    }

    // Crear usuario con validaciones de negocio
    async createUserWithValidation(userData, createdBy) {
        try {
            // Validar datos
            const validationErrors = this.validateUserData(userData);
            if (validationErrors.length > 0) {
                throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
            }

            // Verificar que email y username no existan
            if (userData.email) {
                const emailExists = await userRepository.findByEmail(userData.email);
                if (emailExists) {
                    throw new Error('Ya existe un usuario con este email');
                }
            }

            if (userData.username) {
                const usernameExists = await userRepository.findByUsername(userData.username);
                if (usernameExists) {
                    throw new Error('Ya existe un usuario con este username');
                }
            }

            // Verificar documento único
            if (userData.person_num_doc) {
                const docExists = await userRepository.findByPersonDoc(userData.person_num_doc);
                if (docExists) {
                    throw new Error('Ya existe un usuario con este número de documento');
                }
            }

            // Verificar que tenga al menos email o username
            if (!userData.email && !userData.username) {
                throw new Error('Debe proporcionar al menos un email o username');
            }

            // Crear usuario
            userData.user_created = createdBy;
            const user = await userRepository.createUser(userData);

            return user;

        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    // Actualizar usuario con validaciones
    async updateUserWithValidation(userId, updateData, updatedBy) {
        try {
            // Verificar que el usuario existe
            const existingUser = await userRepository.findById(userId);
            if (!existingUser) {
                throw new Error('Usuario no encontrado');
            }

            // Validar datos a actualizar
            const validationErrors = this.validateUserData(updateData);
            if (validationErrors.length > 0) {
                throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
            }

            // Verificar unicidad de email si se está actualizando
            if (updateData.email) {
                const emailExists = await userRepository.checkUserExists(updateData.email, null, userId);
                if (emailExists) {
                    throw new Error('Ya existe un usuario con este email');
                }
            }

            // Verificar unicidad de username si se está actualizando
            if (updateData.username) {
                const usernameExists = await userRepository.checkUserExists(null, updateData.username, userId);
                if (usernameExists) {
                    throw new Error('Ya existe un usuario con este username');
                }
            }

            // Actualizar usuario
            updateData.user_updated = updatedBy;
            const updated = await userRepository.updateUser(userId, updateData);
            
            if (!updated) {
                throw new Error('No se pudo actualizar el usuario');
            }

            return await userRepository.findById(userId);

        } catch (error) {
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }

    // Obtener perfil completo del usuario
    async getUserProfile(userId) {
        try {
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar si tiene paciente o médico asociado
            const patient = await patientRepository.findByUserId(userId);
            const doctor = await doctorRepository.findByUserId(userId);

            // Determinar rol basado en asociaciones
            let userRole = 'user';
            let roleDetails = null;

            if (patient) {
                userRole = 'patient';
                roleDetails = {
                    type: 'patient',
                    id: patient.id,
                    fullName: `${patient.firstName} ${patient.lastName}`,
                    dni: patient.dni
                };
            } else if (doctor) {
                userRole = 'doctor';
                roleDetails = {
                    type: 'doctor',
                    id: doctor.id,
                    fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                    medicalLicense: doctor.medicalLicense,
                    specialty: doctor.specialty ? doctor.specialty.name : null
                };
            }

            // Formato de respuesta enriquecido
            const profile = {
                ...user.toJSON(),
                userRole,
                roleDetails,
                hasAssociatedProfile: !!(patient || doctor)
            };

            // Remover contraseña del perfil
            delete profile.password;

            return profile;

        } catch (error) {
            throw new Error(`Error al obtener perfil del usuario: ${error.message}`);
        }
    }

    // Cambiar contraseña con validaciones
    async changePasswordWithValidation(userId, currentPassword, newPassword) {
        try {
            // Verificar que el usuario existe
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar contraseña actual
            const isCurrentPasswordValid = await userRepository.verifyPassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('La contraseña actual no es correcta');
            }

            // Validar nueva contraseña
            const validationErrors = this.validateUserData({ password: newPassword });
            if (validationErrors.length > 0) {
                throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
            }

            // Verificar que la nueva contraseña sea diferente
            const isSamePassword = await userRepository.verifyPassword(newPassword, user.password);
            if (isSamePassword) {
                throw new Error('La nueva contraseña debe ser diferente a la actual');
            }

            // Actualizar contraseña
            const updated = await userRepository.updatePassword(userId, newPassword);
            if (!updated) {
                throw new Error('No se pudo actualizar la contraseña');
            }

            return { success: true, message: 'Contraseña actualizada exitosamente' };

        } catch (error) {
            throw new Error(`Error al cambiar contraseña: ${error.message}`);
        }
    }

    // Buscar usuarios con lógica de negocio
    async searchUsersWithBusinessLogic(establishmentId, filters = {}) {
        try {
            // Obtener usuarios base
            const users = await userRepository.findByEstablishment(establishmentId);

            // Aplicar filtros adicionales
            let filteredUsers = users;
            
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredUsers = users.filter(user => 
                    (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                    (user.username && user.username.toLowerCase().includes(searchTerm)) ||
                    (user.person_num_doc && user.person_num_doc.includes(searchTerm))
                );
            }

            if (filters.active !== undefined) {
                filteredUsers = filteredUsers.filter(user => user.active === filters.active);
            }

            // Enriquecer con información de roles
            const enrichedUsers = await Promise.all(
                filteredUsers.map(async (user) => {
                    const patient = await patientRepository.findByUserId(user.id);
                    const doctor = await doctorRepository.findByUserId(user.id);

                    let userRole = 'user';
                    if (patient) userRole = 'patient';
                    else if (doctor) userRole = 'doctor';

                    return {
                        ...user.toJSON(),
                        userRole,
                        hasProfile: !!(patient || doctor)
                    };
                })
            );

            return {
                users: enrichedUsers,
                total: enrichedUsers.length,
                filters: filters
            };

        } catch (error) {
            throw new Error(`Error en búsqueda de usuarios: ${error.message}`);
        }
    }

    // Validar antes de desactivar usuario
    async validateUserDeactivation(userId, requestingUserId) {
        try {
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // No permitir auto-desactivación
            if (parseInt(userId) === parseInt(requestingUserId)) {
                throw new Error('No puedes desactivar tu propia cuenta');
            }

            // Verificar si tiene paciente o médico asociado
            const patient = await patientRepository.findByUserId(userId);
            const doctor = await doctorRepository.findByUserId(userId);

            const warnings = [];
            if (patient) {
                warnings.push('El usuario tiene un perfil de paciente asociado que también será desactivado');
            }
            if (doctor) {
                warnings.push('El usuario tiene un perfil de médico asociado que también será desactivado');
            }

            return { 
                canDeactivate: true, 
                user,
                warnings 
            };

        } catch (error) {
            throw new Error(`Error al validar desactivación: ${error.message}`);
        }
    }

    // Obtener estadísticas de usuarios
    async getUserStatsByEstablishment(establishmentId) {
        try {
            const users = await userRepository.findByEstablishment(establishmentId);
            const allUsers = await userRepository.findByEstablishment(establishmentId);

            // Contar por roles
            let patientCount = 0;
            let doctorCount = 0;
            let regularUserCount = 0;

            for (const user of users) {
                const patient = await patientRepository.findByUserId(user.id);
                const doctor = await doctorRepository.findByUserId(user.id);

                if (patient) patientCount++;
                else if (doctor) doctorCount++;
                else regularUserCount++;
            }

            return {
                total: users.length,
                active: users.filter(u => u.active).length,
                inactive: users.filter(u => !u.active).length,
                byRole: {
                    patients: patientCount,
                    doctors: doctorCount,
                    regular: regularUserCount
                },
                establishment: establishmentId
            };

        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    // Verificar disponibilidad de credenciales
    async checkCredentialsAvailability(email, username, excludeUserId = null) {
        try {
            const result = {
                email: { available: true, exists: false },
                username: { available: true, exists: false }
            };

            if (email) {
                const emailExists = await userRepository.checkUserExists(email, null, excludeUserId);
                result.email = { available: !emailExists, exists: emailExists };
            }

            if (username) {
                const usernameExists = await userRepository.checkUserExists(null, username, excludeUserId);
                result.username = { available: !usernameExists, exists: usernameExists };
            }

            return result;

        } catch (error) {
            throw new Error(`Error al verificar disponibilidad: ${error.message}`);
        }
    }
}

module.exports = new UserService();