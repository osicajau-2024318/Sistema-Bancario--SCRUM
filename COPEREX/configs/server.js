/**
 * Configuración de Express: middlewares globales y registro de rutas.
 * Exporta la app para que index.js la levante con listen().
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { requestLimit } from '../middlewares/request-limit.js';
import authRoutes from '../src/routes/auth.routes.js';
import adminRoutes from '../src/routes/admin.routes.js';
import companyRoutes from '../src/routes/company.routes.js';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(requestLimit);

app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/companies', companyRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'La ruta solicitada no existe',
  });
});

export default app;
