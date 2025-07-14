const createRouter = require('../../shared/utils/routerFactory');
const doctorController = require('../controllers/doctorController');

const routes = [
    // Crear médico
    { method: 'post', path: '/', handler: doctorController.createDoctor },
    
    // Búsqueda y listado
    { method: 'get', path: '/search', handler: doctorController.searchDoctors },
    { method: 'get', path: '/active', handler: doctorController.getActiveDoctors },
    { method: 'get', path: '/paginated', handler: doctorController.getDoctorsWithPagination },
    
    // Por especialidad
    { method: 'get', path: '/specialty/:specialtyId', handler: doctorController.getDoctorsBySpecialty },
    
    // Estadísticas y reportes
    { method: 'get', path: '/stats', handler: doctorController.getDoctorStats },
    
    // Verificaciones
    { method: 'get', path: '/check-license/:license', handler: doctorController.checkLicenseAvailability },
    
    // Operaciones por ID
    { method: 'get', path: '/:id', handler: doctorController.getDoctorById },
    { method: 'put', path: '/:id', handler: doctorController.updateDoctor },
    { method: 'delete', path: '/:id', handler: doctorController.deactivateDoctor },
    { method: 'patch', path: '/:id/activate', handler: doctorController.activateDoctor },
    
    // Cambiar especialidad
    { method: 'patch', path: '/:id/specialty', handler: doctorController.changeSpecialty },
    
    // Búsqueda por licencia
    { method: 'get', path: '/license/:license', handler: doctorController.getDoctorByLicense },
];

module.exports = createRouter(routes);