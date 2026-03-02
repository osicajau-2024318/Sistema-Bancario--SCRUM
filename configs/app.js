'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { errorHandler } from '../middlewares/handle-errors.js';
import accountRoutes from '../src/routes/account.routes.js';
import transactionRoutes from '../src/routes/transaction.routes.js';
import depositRoutes from '../src/routes/deposit.routes.js';
import productRoutes from '../src/routes/product.routes.js';
import favoriteRoutes from '../src/routes/favorite.routes.js';
import currencyRoutes from '../src/routes/currency.routes.js';


const BASE_PATH = '/SistemaBancarioAdmin/v1';

const middlewares = (app) => {
    
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(requestLimit);
    app.use(morgan('dev'));
}

const routes = (app) => {
    app.use(`${BASE_PATH}/accounts`, accountRoutes);
    app.use(`${BASE_PATH}/transactions`, transactionRoutes);
    app.use(`${BASE_PATH}/deposits`, depositRoutes);
    app.use(`${BASE_PATH}/products`, productRoutes);
    app.use(`${BASE_PATH}/favorites`, favoriteRoutes);
    app.use(`${BASE_PATH}/currency`, currencyRoutes);
    app.get(`${BASE_PATH}/Health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Sistema Bancario Server'
        })
    })

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado en Admin Api'
        })
    })
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('trust proxy', 1);
    try {
        await dbConnection();
        middlewares(app);
        routes(app);

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Sistema Banco server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        })
    } catch (error) {
        console.error(`Error starting Admin Server: ${error.message}`);
        process.exit(1);
    }
}