// Importa la librería dotenv para cargar variables de entorno desde .env
import dotenv from 'dotenv';
// Importa la función initServer que inicializa el servidor Express
import { initServer } from './configs/app.js';

// Carga las variables de entorno del archivo .env
dotenv.config();

// Función asíncrona que inicia la aplicación
const startApp = async () => {
    // Inicializa el servidor Express con todas sus configuraciones
    await initServer();
};

// Ejecuta la función para arrancar la aplicación
startApp();