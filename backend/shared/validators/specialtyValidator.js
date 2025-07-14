const { body, param, query, validationResult } = require('express-validator');
const { apiResponse } = require('../helpers/apiResponseHelper');

// Validaciones para crear especialidad
const validateCreateSpecialty = [
    body('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s\-\.]+$/)
        .withMessage('El nombre solo puede contener letras, espacios, guiones y puntos'),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('El estado activo debe ser un valor booleano'),
];

// Validaciones para actualizar especialidad
const validateUpdateSpecialty = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID de la especialidad debe ser un número entero positivo'),
    
    body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s\-\.]+$/)
        .withMessage('El nombre solo puede contener letras, espacios, guiones y puntos'),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('El estado activo debe ser un valor booleano'),
];

// Validaciones para búsqueda
const validateSearchSpecialties = [
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),
    
    query('isActive')
        .optional()
        .isBoolean()
        .withMessage('El filtro de estado activo debe ser un valor booleano'),
    
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
const validateSpecialtyId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID de la especialidad debe ser un número entero positivo'),
];

// Validación de nombre en parámetros
const validateNameParam = [
    param('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s\-\.]+$/)
        .withMessage('El nombre solo puede contener letras, espacios, guiones y puntos'),
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
    validateCreateSpecialty,
    validateUpdateSpecialty,
    validateSearchSpecialties,
    validateSpecialtyId,
    validateNameParam,
    handleValidationErrors
};