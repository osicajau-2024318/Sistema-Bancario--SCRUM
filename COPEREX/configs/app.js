/**
 * Centraliza y exporta las variables de entorno.
 * Valida que las variables críticas existan al arrancar; si falta alguna, lanza error.
 */

const required = ['PORT', 'MONGODB_URI'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Variable de entorno requerida no definida: ${key}`);
  }
});

export const env = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '8h',
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD,
};
