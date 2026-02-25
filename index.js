import dotenv from 'dotenv';
import { initServer } from './configs/app.js';
import { createDefaultAdmin } from './utils/seed-admin.js';

dotenv.config();

const startApp = async () => {
    await initServer();
    await createDefaultAdmin();
};

startApp();