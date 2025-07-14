const createRouter = require('../../shared/utils/routerFactory');
const specialtyController = require('../controllers/specialtyController');

const routes = [
    // Crear especialidad
    { method: 'post', path: '/', handler: specialtyController.createSpecialty },
    
    // Búsqueda y listado
    { method: 'get', path: '/search', handler: specialtyController.searchSpecialties },
    { method: 'get', path: '/active', handler: specialtyController.getActiveSpecialties },
    { method: 'get', path: '/all', handler: specialtyController.getAllSpecialties },
    { method: 'get', path: '/paginated', handler: specialtyController.getSpecialtiesWithPagination },
    
    // Estadísticas y reportes
    { method: 'get', path: '/stats', handler: specialtyController.getSpecialtyStats },
    
    // Verificaciones
    { method: 'get', path: '/check-name/:name', handler: specialtyController.checkNameAvailability },
    
    // Operaciones por ID
    { method: 'get', path: '/:id', handler: specialtyController.getSpecialtyById },
    { method: 'get', path: '/:id/doctors', handler: specialtyController.getSpecialtyWithDoctors },
    { method: 'put', path: '/:id', handler: specialtyController.updateSpecialty },
    { method: 'delete', path: '/:id', handler: specialtyController.deactivateSpecialty },
    { method: 'patch', path: '/:id/activate', handler: specialtyController.activateSpecialty },
];

module.exports = createRouter(routes);