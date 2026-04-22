'use strict';

// Importa Express para crear el servidor web
import express from 'express';
// Importa CORS para permitir peticiones desde otros dominios
import cors from 'cors';
// Importa Helmet para agregar seguridad con headers HTTP
import helmet from 'helmet';
// Importa Morgan para logging de peticiones HTTP
import morgan from 'morgan';
// Importa la función de conexión a la base de datos MongoDB
import { dbConnection } from './db.js';
// Importa la configuración de CORS (orígenes permitidos)
import { corsOptions } from './cors-configuration.js';
// Importa la configuración de seguridad de Helmet
import { helmetConfiguration } from './helmet-configuration.js';
// Importa el middleware para limitar peticiones (rate limiting)
import { requestLimit } from '../middlewares/request-limit.js';
// Importa el manejador global de errores
import { errorHandler } from '../middlewares/handle-errors.js';
// Importa las rutas de cuentas bancarias
import accountRoutes from '../src/routes/account.routes.js';
// Importa las rutas de transacciones
import transactionRoutes from '../src/routes/transaction.routes.js';
// Importa las rutas de depósitos
import depositRoutes from '../src/routes/deposit.routes.js';
// Importa las rutas de servicios del banco (beneficios, solo admin)
import serviceRoutes from '../src/routes/service.routes.js';
// Importa las rutas de cuentas favoritas
import favoriteRoutes from '../src/routes/favorite.routes.js';
// Importa las rutas de conversión de moneda
import currencyRoutes from '../src/routes/currency.routes.js';
// Importa la configuración de Swagger
import { registerSwagger } from '../docs/swagger.js';

// Ruta base para todos los endpoints de la API
const BASE_PATH = '/SistemaBancarioAdmin/v1';

// Función que configura todos los middlewares de Express
const middlewares = (app) => {
    // Parsea datos de formularios URL-encoded con límite de 10mb
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    // Parsea datos JSON con límite de 10mb
    app.use(express.json({ limit: '10mb' }));
    // Habilita CORS con las opciones configuradas
    app.use(cors(corsOptions));
    // Aplica configuración de seguridad con Helmet
    app.use(helmet(helmetConfiguration));
    // Aplica limitación de peticiones por IP
    app.use(requestLimit);
    // Logger de peticiones HTTP en modo desarrollo
    app.use(morgan('dev'));
}

// Función que registra todas las rutas de la API
const routes = (app) => {
    // Rutas para manejo de cuentas bancarias
    app.use(`${BASE_PATH}/accounts`, accountRoutes);
    // Rutas para transacciones entre cuentas
    app.use(`${BASE_PATH}/transactions`, transactionRoutes);
    // Rutas para depósitos
    app.use(`${BASE_PATH}/deposits`, depositRoutes);
    // Rutas para servicios/beneficios del banco (solo administrador)
    app.use(`${BASE_PATH}/services`, serviceRoutes);
    // Rutas para cuentas favoritas del usuario
    app.use(`${BASE_PATH}/favorites`, favoriteRoutes);
    // Rutas para conversión de moneda
    app.use(`${BASE_PATH}/currency`, currencyRoutes);
    // Endpoint de health check para verificar que el servidor está funcionando
    app.get(`${BASE_PATH}/health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Sistema Bancario Server'
        })
    })
}

// Función principal que inicializa el servidor Express
export const initServer = async () => {
    // Crea la aplicación Express
    const app = express();
    // Obtiene el puerto del archivo .env
    const PORT = process.env.PORT;
    // Confía en el primer proxy (necesario para rate limiting detrás de proxies)
    app.set('trust proxy', 1);
    try {
        // Conecta a la base de datos MongoDB
        await dbConnection();
        // Configura todos los middlewares
        middlewares(app);
        // Registra todas las rutas de la API
        routes(app);
        // Registra la documentación Swagger
        registerSwagger(app);

        // Maneja rutas no encontradas (404)
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint no encontrado en Admin Api'
            })
        });

        // Aplica el manejador de errores al final de todo
        app.use(errorHandler);

        // Inicia el servidor en el puerto especificado
        app.listen(PORT, () => {
            console.log(`Sistema Banco server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        })
    } catch (error) {
        // Si hay error al iniciar, muestra el error y termina el proceso
        console.error(`Error starting Admin Server: ${error.message}`);
        process.exit(1);
    }
}