const { body, param, query, validationResult } = require('express-validator');
const { apiResponse } = require('../helpers/apiResponseHelper');

// Validaciones para crear médico
const validateCreateDoctor = [
    body('userId')
        .isInt({ min: 1 })
        .withMessage('El ID de usuario debe ser un número entero positivo'),
    
    body('medicalLicense')
        .isLength({ min: 5, max: 50 })
        .withMessage('La licencia médica debe tener entre 5 y 50 caracteres')
        .matches(/^[A-Z0-9\-]+$/)
        .withMessage('La licencia médica debe contener solo letras mayúsculas, números y guiones'),
    
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
    
    body('specialtyId')
        .isInt({ min: 1 })
        .withMessage('El ID de especialidad debe ser un número entero positivo'),
    
    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]{7,20}$/)
        .withMessage('El formato del teléfono no es válido'),
];

// Validaciones para actualizar médico
const validateUpdateDoctor = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del médico debe ser un número entero positivo'),
    
    body('medicalLicense')
        .optional()
        .isLength({ min: 5, max: 50 })
        .withMessage('La licencia médica debe tener entre 5 y 50 caracteres')
        .matches(/^[A-Z0-9\-]+$/)
        .withMessage('La licencia médica debe contener solo letras mayúsculas, números y guiones'),
    
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
    
    body('specialtyId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de especialidad debe ser un número entero positivo'),
    
    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]{7,20}$/)
        .withMessage('El formato del teléfono no es válido'),
];

// Validaciones para cambio de especialidad
const validateChangeSpecialty = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del médico debe ser un número entero positivo'),
    
    body('specialtyId')
        .isInt({ min: 1 })
        .withMessage('El ID de especialidad debe ser un número entero positivo'),
];

// Validaciones para búsqueda
const validateSearchDoctors = [
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),
    
    query('specialtyId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de especialidad debe ser un número entero positivo'),
    
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
const validateDoctorId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del médico debe ser un número entero positivo'),
];

// Validación de especialidad ID en parámetros
const validateSpecialtyIdParam = [
    param('specialtyId')
        .isInt({ min: 1 })
        .withMessage('El ID de especialidad debe ser un número entero positivo'),
];

// Validación de licencia médica en parámetros
const validateLicenseParam = [
    param('license')
        .isLength({ min: 5, max: 50 })
        .withMessage('La licencia médica debe tener entre 5 y 50 caracteres')
        .matches(/^[A-Z0-9\-]+$/)
        .withMessage('La licencia médica debe contener solo letras mayúsculas, números y guiones'),
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
    validateCreateDoctor,
    validateUpdateDoctor,
    validateChangeSpecialty,
    validateSearchDoctors,
    validateDoctorId,
    validateSpecialtyIdParam,
    validateLicenseParam,
    handleValidationErrors
};