const { Sequelize, DataTypes, Op } = require("sequelize");
require("dotenv").config();

let currentSequelize;

function createSequelizeInstance(dbName) {
  return new Sequelize(dbName, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: (sql) => console.log(`[DB Query] ${sql}`),
    timezone: "-05:00",
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      timezone: "-05:00",
      dateStrings: true,
      typeCast: true,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
    },
  });
}

const masterSequelize = createSequelizeInstance(process.env.DB_NAME);
currentSequelize = masterSequelize;

function setCurrentSequelize(sequelize) {
  currentSequelize = sequelize;
  // Actualizar modelos con la nueva conexión
  Object.values(currentSequelize.models).forEach((model) => {
    model.sequelize = currentSequelize;
  });
}

function getSequelize() {
  return currentSequelize;
}

module.exports = {
  Sequelize,
  DataTypes,
  Op,
  masterSequelize,
  createSequelizeInstance,
  setCurrentSequelize,
  getSequelize,
};
