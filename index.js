import dotenv from 'dotenv';
import { initServer } from './configs/app.js';

dotenv.config();

const startApp = async () => {
    await initServer();
};

startApp();