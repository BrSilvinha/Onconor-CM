const createRouter = require('../../shared/utils/routerFactory');
const userController = require('../controllers/userController');
const routes = [
  { method: 'get', path: '/search', handler: userController.searchUsers },
  
  { method: 'get', path: '/:id', handler: userController.getUserById },
  
  // Actualizar usuario
  { method: 'put', path: '/:id', handler: userController.updateUser },
  
  { method: 'get', path: '/establishment/:establishmentId', handler:  userController.getUsersByEstablishment},
  
  { method: 'delete', path: '/:id', handler:userController.deactivateUser },
  
  { method: 'patch', path: '/:id/activate', handler: userController.activateUser},
];

module.exports = createRouter(routes);
