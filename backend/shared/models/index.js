const { setupAssociations } = require('./associations');

// Configurar asociaciones al importar
const models = setupAssociations();

module.exports = models;