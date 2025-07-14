const createRouter = require('../../shared/utils/routerFactory');
const patientController = require('../controllers/patientController');

const routes = [
    // Crear paciente
    { method: 'post', path: '/', handler: patientController.createPatient },
    
    // Búsqueda y listado
    { method: 'get', path: '/search', handler: patientController.searchPatients },
    { method: 'get', path: '/active', handler: patientController.getActivePatients },
    { method: 'get', path: '/paginated', handler: patientController.getPatientsWithPagination },
    
    // Estadísticas y reportes
    { method: 'get', path: '/stats', handler: patientController.getPatientStats },
    
    // Verificaciones
    { method: 'get', path: '/check-dni/:dni', handler: patientController.checkDniAvailability },
    
    // Operaciones por ID
    { method: 'get', path: '/:id', handler: patientController.getPatientById },
    { method: 'put', path: '/:id', handler: patientController.updatePatient },
    { method: 'delete', path: '/:id', handler: patientController.deactivatePatient },
    { method: 'patch', path: '/:id/activate', handler: patientController.activatePatient },
    
    // Búsqueda por DNI
    { method: 'get', path: '/dni/:dni', handler: patientController.getPatientByDni },
];

module.exports = createRouter(routes);