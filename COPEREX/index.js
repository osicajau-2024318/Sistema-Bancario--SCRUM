/**
 * Punto de entrada: carga variables de entorno, conecta a MongoDB,
 * ejecuta el seed del admin y levanta el servidor Express.
 */

import 'dotenv/config';
import { env } from './configs/app.js';
import { connectMongo } from './configs/mongo.js';
import { checkAndCreateDefaultAdmin } from './seeds/admin.seed.js';
import app from './configs/server.js';

const start = async () => {
  await connectMongo();
  await checkAndCreateDefaultAdmin();

  app.listen(env.PORT, () => {
    console.log(`Servidor COPEREX corriendo en http://localhost:${env.PORT}`);
    console.log(`Rutas: /api/auth, /api/admins, /api/companies`);
  });
};

start().catch((err) => {
  console.error('Error al iniciar:', err.message);
  process.exit(1);
});
