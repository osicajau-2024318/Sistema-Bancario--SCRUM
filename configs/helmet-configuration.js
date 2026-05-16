// Configuración de Helmet para agregar seguridad HTTP mediante headers
export const helmetConfiguration = {
    // Política de seguridad de contenido (CSP)
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            // Solo permite recursos del mismo origen por defecto
            defaultSrc: ["'self'"],
            // Permite scripts del mismo origen y scripts inline
            scriptSrc: ["'self'", "'unsafe-inline'"],
            // Permite estilos del mismo origen y estilos inline
            styleSrc: ["'self'", "'unsafe-inline'"],
            // Permite imágenes del mismo origen, data URIs y blobs
            imgSrc: ["'self'", 'data:', 'blob:'],
            // Permite conexiones fetch/XHR solo al mismo origen
            connectSrc: ["'self'"],
            // Permite fuentes solo del mismo origen
            fontSrc: ["'self'"],
            // No permite objetos embebidos (Flash, etc)
            objectSrc: ["'none'"],
            // El tag <base> solo puede apuntar al mismo origen
            baseUri: ["'self'"],
            // No permite que la página sea embebida en iframes
            frameAncestors: ["'none'"],
        },
    },
    // HSTS desactivado por simplicidad (evita depender de entornos). Activar solo si se requiere.
    hsts: false,
    // Cabeceras básicas y útiles para API
    // Previene que la página sea mostrada en un iframe
    frameguard: { action: 'deny' },
    // Previene que el navegador haga sniffing del MIME type
    noSniff: true,
    // Oculta el header X-Powered-By que revela tecnología usada
    hidePoweredBy: true,
    // Compatibilidad con Swagger UI y recursos embebidos
    // Permite compartir recursos entre orígenes
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Desactiva la política de embedder para compatibilidad
    crossOriginEmbedderPolicy: false,
};
