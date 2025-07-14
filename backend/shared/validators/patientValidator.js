const { body, param, query, validationResult } = require('express-validator');
const { apiResponse } = require('../helpers/apiResponseHelper');

// Validaciones para crear paciente
const validateCreatePatient = [
    body('userId')
        .isInt({ min: 1 })
        .withMessage('El ID de usuario debe ser un número entero positivo'),
    
    body('dni')
        .isLength({ min: 8, max: 8 })
        .withMessage('El DNI debe tener exactamente 8 caracteres')
        .matches(/^\d{8}$/)
        .withMessage('El DNI debe contener solo números'),
    
    body('firstName')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('lastName')
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('El apellido solo puede contener letras y espacios'),
    
    body('dateOfBirth')
        .isISO8601()
        .withMessage('La fecha de nacimiento debe ser una fecha válida')
        .custom((value) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 0 || age > 150) {
                throw new Error('La fecha de nacimiento no es válida');
            }
            return true;
        }),
    
    body('gender')
        .isIn(['M', 'F', 'O'])
        .withMessage('El género debe ser M (Masculino), F (Femenino) o O (Otro)'),
    
    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]{7,20}$/)
        .withMessage('El formato del teléfono no es válido'),
    
    body('address')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La dirección no puede exceder 500 caracteres'),
    
    body('emergencyContact')
        .optional()
        .isLength({ max: 200 })
        .withMessage('El contacto de emergencia no puede exceder 200 caracteres'),
];

// Validaciones para actualizar paciente
const validateUpdatePatient = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del paciente debe ser un número entero positivo'),
    
    body('dni')
        .optional()
        .isLength({ min: 8, max: 8 })
        .withMessage('El DNI debe tener exactamente 8 caracteres')
        .matches(/^\d{8}$/)
        .withMessage('El DNI debe contener solo números'),
    
    body('firstName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('lastName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('El apellido solo puede contener letras y espacios'),
    
    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('La fecha de nacimiento debe ser una fecha válida')
        .custom((value) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 0 || age > 150) {
                throw new Error('La fecha de nacimiento no es válida');
            }
            return true;
        }),
    
    body('gender')
        .optional()
        .isIn(['M', 'F', 'O'])
        .withMessage('El género debe ser M (Masculino), F (Femenino) o O (Otro)'),
    
    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]{7,20}$/)
        .withMessage('El formato del teléfono no es válido'),
    
    body('address')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La dirección no puede exceder 500 caracteres'),
    
    body('emergencyContact')
        .optional()
        .isLength({ max: 200 })
        .withMessage('El contacto de emergencia no puede exceder 200 caracteres'),
];

// Validaciones para búsqueda
const validateSearchPatients = [
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),
    
    query('gender')
        .optional()
        .isIn(['M', 'F', 'O'])
        .withMessage('El género debe ser M, F o O'),
    
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),
];

// Validación de parámetros ID
const validatePatientId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del paciente debe ser un número entero positivo'),
];

// Validación de DNI en parámetros
const validateDniParam = [
    param('dni')
        .isLength({ min: 8, max: 8 })
        .withMessage('El DNI debe tener exactamente 8 caracteres')
        .matches(/^\d{8}$/)
        .withMessage('El DNI debe contener solo números'),
];

// Middleware para procesar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return apiResponse.badRequest(res, 'Errores de validación', { errors: errorMessages });
    }
    next();
};

module.exports = {
    validateCreatePatient,
    validateUpdatePatient,
    validateSearchPatients,
    validatePatientId,
    validateDniParam,
    handleValidationErrors
};