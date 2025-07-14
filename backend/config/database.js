const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos usando las variables del .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      freezeTableName: true,
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      timezone: 'Etc/GMT-5', // Zona horaria de Perú
    },
  }
);

// Función para probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida exitosamente.');
    return true;
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error.message);
    return false;
  }
}

// Función para sincronizar la base de datos
async function syncDatabase() {
  try {
    const forceSync = process.env.SEQUELIZE_FORCE_SYNC === 'true';
    const alterSync = process.env.SEQUELIZE_ALTER_SYNC === 'true';
    const autoSync = process.env.SEQUELIZE_AUTO_SYNC === 'true';

    if (!autoSync) {
      console.log('🔄 Sincronización automática deshabilitada');
      return;
    }

    console.log('🔄 Iniciando sincronización de la base de datos...');
    
    if (forceSync) {
      console.log('⚠️  ADVERTENCIA: FORCE=true - Se eliminarán TODAS las tablas y datos');
    }
    
    if (alterSync) {
      console.log('📝 ALTER=true - Se modificarán las tablas existentes');
    }

    // Importar todos los modelos antes de sincronizar
    require('../users/models/user')();
    
    await sequelize.sync({ 
      force: forceSync,
      alter: alterSync 
    });
    
    console.log('✅ Base de datos sincronizada exitosamente');
    console.log(`📊 Modelos registrados: ${Object.keys(sequelize.models).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
