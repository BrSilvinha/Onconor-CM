const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Determinar el entorno y cargar el archivo .env apropiado
const env = process.env.NODE_ENV || 'development'; 
let envPath;
if (env === 'production') {
    envPath = path.resolve(__dirname, '.env.production');
} else if (env === 'qas') {
    envPath = path.resolve(__dirname, '.env.development');
} else if (env === 'development') {
    envPath = path.resolve(__dirname, '.env');
} else {
    envPath = path.resolve(__dirname, '.env');
}

// Cargar las variables de entorno
console.log(`Loading environment file: ${envPath}`);
dotenv.config({ path: envPath });

// Importar configuración de base de datos
const { testConnection, syncDatabase } = require('./config/database');

// Crear la instancia de Express
const app = express();



// Configuración de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));
app.get('/', (req, res) => {
    res.send('🚀 API está activa y funcionando correctamente! ✅');
});

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));


// Rutas principales
const routes = require('./routes');
app.use('/v1/api', routes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Log para mostrar entorno y variables clave
console.log('Environment:', env);
console.log('Server URL:', process.env.SERVER_URL);

// Puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3000;

// Función para inicializar la base de datos y el servidor
async function initializeApp() {
    try {
        // Probar conexión a la base de datos
        const isConnected = await testConnection();
        
        if (!isConnected) {
            console.error('❌ No se pudo establecer conexión con la base de datos');
            process.exit(1);
        }
        
        // Sincronizar la base de datos
        await syncDatabase();
        
        // Iniciar el servidor solo si la BD está lista
        app.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
            console.log(`🌍 Environment: ${env}`);
            console.log(`🔗 API URL: http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error.message);
        process.exit(1);
    }
}

// Inicializar la aplicación
initializeApp();

module.exports = app;
