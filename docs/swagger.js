import swaggerUi from 'swagger-ui-express';

const BASE_PATH = '/SistemaBancarioAdmin/v1';

const TAGS = [
  {
    name: 'Productos',
    description: 'Gestión de productos del banco',
  },
  {
    name: 'Servicios',
    description: 'Gestión de servicios del banco',
  },
];

const AUTH_SECURITY = [{ bearerAuth: [] }];

const MONGO_ID_SCHEMA = {
  type: 'string',
  pattern: '^[0-9a-fA-F]{24}$',
  example: '67f6f2cf2a1e6b17f34ef001',
};

const COMMON_RESPONSES = {
  BadRequest: {
    description: 'Solicitud inválida',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          message: 'No se proporcionaron datos para actualizar',
          error: 'VALIDATION_ERROR',
        },
      },
    },
  },
  Unauthorized: {
    description: 'Token faltante, expirado o inválido',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/AuthErrorResponse' },
        example: {
          success: false,
          message: 'No se proporcionó un token de acceso',
          error: 'MISSING_TOKEN',
        },
      },
    },
  },
  Forbidden: {
    description: 'El rol no tiene permiso para esta operación',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          message: 'No tiene permisos para realizar esta acción',
          error: 'FORBIDDEN',
        },
      },
    },
  },
  InvalidId: {
    description: 'ID inválido',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/InvalidIdResponse' },
        example: {
          success: false,
          message: 'ID no válido',
          error: 'INVALID_ID',
        },
      },
    },
  },
  InternalServerError: {
    description: 'Error interno',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: {
          success: false,
          message: 'Error interno del servidor',
          error: 'INTERNAL_SERVER_ERROR',
        },
      },
    },
  },
};

const PRODUCT_PATHS = {
  [`${BASE_PATH}/products`]: {
    post: {
      tags: ['Productos'],
      operationId: 'createProduct',
      summary: 'Crear producto',
      description: 'Crea un producto nuevo (solo admin).',
      security: AUTH_SECURITY,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProductCreateInput' },
            examples: {
              ejemplo: {
                value: {
                  name: 'Cuenta de Ahorros Premium',
                  description: 'Cuenta con intereses altos',
                  type: 'PRODUCTO',
                  price: 0,
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Producto creado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductMutationResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    get: {
      tags: ['Productos'],
      operationId: 'listProducts',
      summary: 'Listar productos',
      description: 'Lista productos/servicios. Permite filtrar por tipo y estado.',
      parameters: [
        {
          in: 'query',
          name: 'type',
          required: false,
          description: 'Tipo de producto/servicio.',
          schema: {
            type: 'string',
            enum: ['PRODUCTO', 'SERVICIO'],
          },
        },
        {
          in: 'query',
          name: 'is_active',
          required: false,
          description: 'Estado del producto.',
          schema: { type: 'boolean' },
        },
      ],
      responses: {
        200: {
          description: 'Productos obtenidos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductListResponse' },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  [`${BASE_PATH}/products/{id}`]: {
    get: {
      tags: ['Productos'],
      operationId: 'getProductById',
      summary: 'Obtener producto por ID',
      description: 'Obtiene un producto por su ID.',
      parameters: [{ $ref: '#/components/parameters/IdPathParam' }],
      responses: {
        200: {
          description: 'Producto encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductGetResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/InvalidId' },
        404: {
          description: 'Producto no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    put: {
      tags: ['Productos'],
      operationId: 'updateProductById',
      summary: 'Actualizar producto por ID',
      description: 'Actualiza uno o varios campos de un producto (solo admin).',
      security: AUTH_SECURITY,
      parameters: [{ $ref: '#/components/parameters/IdPathParam' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProductUpdateInput' },
          },
        },
      },
      responses: {
        200: {
          description: 'Producto actualizado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductMutationResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/InvalidId' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: {
          description: 'Producto no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    delete: {
      tags: ['Productos'],
      operationId: 'deleteProductById',
      summary: 'Eliminar producto',
      description: 'Elimina un producto (solo admin).',
      security: AUTH_SECURITY,
      parameters: [{ $ref: '#/components/parameters/IdPathParam' }],
      responses: {
        200: {
          description: 'Producto eliminado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductMutationResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/InvalidId' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: {
          description: 'Producto no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
};

const SERVICE_PATHS = {
  [`${BASE_PATH}/services`]: {
    post: {
      tags: ['Servicios'],
      operationId: 'createService',
      summary: 'Crear servicio',
      description: 'Crea un servicio nuevo (solo admin).',
      security: AUTH_SECURITY,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ServiceCreateInput' },
            examples: {
              ejemplo: {
                value: {
                  name: 'Consulta de Saldo',
                  description: 'Servicio gratuito de consulta',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Servicio creado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceMutationResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    get: {
      tags: ['Servicios'],
      operationId: 'listServices',
      summary: 'Listar servicios',
      description: 'Lista servicios (solo admin).',
      security: AUTH_SECURITY,
      parameters: [
        {
          in: 'query',
          name: 'is_active',
          required: false,
          description: 'Estado del servicio.',
          schema: { type: 'boolean' },
        },
        {
          in: 'query',
          name: 'assigned_to',
          required: false,
          description: 'ID del usuario asignado.',
          schema: { $ref: '#/components/schemas/MongoId' },
        },
      ],
      responses: {
        200: {
          description: 'Servicios obtenidos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceListResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  [`${BASE_PATH}/services/{id}`]: {
    get: {
      tags: ['Servicios'],
      operationId: 'getServiceById',
      summary: 'Obtener servicio por ID',
      description: 'Obtiene un servicio por su ID (solo admin).',
      security: AUTH_SECURITY,
      parameters: [{ $ref: '#/components/parameters/IdPathParam' }],
      responses: {
        200: {
          description: 'Servicio encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceGetResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/InvalidId' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: {
          description: 'Servicio no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    put: {
      tags: ['Servicios'],
      operationId: 'updateServiceById',
      summary: 'Actualizar servicio por ID',
      description: 'Actualiza uno o varios campos de un servicio (solo admin).',
      security: AUTH_SECURITY,
      parameters: [{ $ref: '#/components/parameters/IdPathParam' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ServiceUpdateInput' },
          },
        },
      },
      responses: {
        200: {
          description: 'Servicio actualizado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceMutationResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/InvalidId' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: {
          description: 'Servicio no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    delete: {
      tags: ['Servicios'],
      operationId: 'deleteServiceById',
      summary: 'Eliminar servicio',
      description: 'Elimina un servicio (solo admin).',
      security: AUTH_SECURITY,
      parameters: [{ $ref: '#/components/parameters/IdPathParam' }],
      responses: {
        200: {
          description: 'Servicio eliminado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceMutationResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/InvalidId' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: {
          description: 'Servicio no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
};

const FAVORITE_PATHS = {
  // Favoritos ya documentados por otra persona
};

const COMPONENTS = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Authorization: Bearer <token>',
    },
  },
  parameters: {
    IdPathParam: {
      in: 'path',
      name: 'id',
      required: true,
      schema: { $ref: '#/components/schemas/MongoId' },
    },
  },
  responses: COMMON_RESPONSES,
  schemas: {
    MongoId: MONGO_ID_SCHEMA,
    ErrorResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', nullable: true, example: false },
        message: { type: 'string', example: 'Error al procesar la solicitud' },
        error: {
          oneOf: [{ type: 'string' }, { type: 'object' }],
          nullable: true,
          example: 'VALIDATION_ERROR',
        },
      },
    },
    AuthErrorResponse: {
      allOf: [
        { $ref: '#/components/schemas/ErrorResponse' },
        {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              enum: ['MISSING_TOKEN', 'TOKEN_EXPIRED', 'INVALID_TOKEN'],
            },
          },
        },
      ],
    },
    InvalidIdResponse: {
      allOf: [
        { $ref: '#/components/schemas/ErrorResponse' },
        {
          type: 'object',
          properties: { error: { type: 'string', example: 'INVALID_ID' } },
        },
      ],
    },

    Product: {
      type: 'object',
      properties: {
        _id: { $ref: '#/components/schemas/MongoId' },
        name: { type: 'string', maxlength: 100 },
        description: { type: 'string', maxlength: 500 },
        type: { type: 'string', enum: ['PRODUCTO', 'SERVICIO'] },
        price: { type: 'number', minimum: 0 },
        is_active: { type: 'boolean', default: true },
        created_by: { type: 'string', maxlength: 16 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    ProductCreateInput: {
      type: 'object',
      required: ['name', 'type', 'price'],
      properties: {
        name: { type: 'string', maxlength: 100 },
        description: { type: 'string', maxlength: 500 },
        type: { type: 'string', enum: ['PRODUCTO', 'SERVICIO'] },
        price: { type: 'number', minimum: 0 },
      },
    },
    ProductUpdateInput: {
      type: 'object',
      minProperties: 1,
      properties: {
        name: { type: 'string', maxlength: 100 },
        description: { type: 'string', maxlength: 500 },
        price: { type: 'number', minimum: 0 },
        is_active: { type: 'boolean' },
      },
      example: {
        name: 'Cuenta Premium Actualizada',
        price: 10.00,
      },
    },
    ProductMutationResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Producto creado correctamente' },
        product: { $ref: '#/components/schemas/Product' },
      },
    },
    ProductGetResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        product: { $ref: '#/components/schemas/Product' },
      },
    },
    ProductListResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        total: { type: 'integer', example: 2 },
        products: {
          type: 'array',
          items: { $ref: '#/components/schemas/Product' },
        },
      },
    },

    Service: {
      type: 'object',
      properties: {
        _id: { $ref: '#/components/schemas/MongoId' },
        name: { type: 'string', maxlength: 100 },
        description: { type: 'string', maxlength: 500 },
        is_active: { type: 'boolean', default: true },
        created_by: { type: 'string', maxlength: 64 },
        assigned_to: { type: 'string', nullable: true, maxlength: 64 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    ServiceCreateInput: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', maxlength: 100 },
        description: { type: 'string', maxlength: 500 },
        assigned_to: { type: 'string', maxlength: 64 },
      },
    },
    ServiceUpdateInput: {
      type: 'object',
      minProperties: 1,
      properties: {
        name: { type: 'string', maxlength: 100 },
        description: { type: 'string', maxlength: 500 },
        is_active: { type: 'boolean' },
        assigned_to: { type: 'string', nullable: true, maxlength: 64 },
      },
      example: {
        name: 'Servicio Actualizado',
        is_active: false,
      },
    },
    ServiceMutationResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Servicio creado correctamente' },
        service: { $ref: '#/components/schemas/Service' },
      },
    },
    ServiceGetResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        service: { $ref: '#/components/schemas/Service' },
      },
    },
    ServiceListResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        total: { type: 'integer', example: 2 },
        services: {
          type: 'array',
          items: { $ref: '#/components/schemas/Service' },
        },
      },
    },

  },
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Sistema Bancario Admin API - Productos y Servicios',
    description: 'Documentación de Productos y Servicios del banco.',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local' }],
  tags: TAGS,
  paths: {
    ...PRODUCT_PATHS,
    ...SERVICE_PATHS,
  },
  components: COMPONENTS,
};

export const registerSwagger = (app, basePath = BASE_PATH) => {
  app.use(
    `${basePath}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Sistema Bancario Admin API - Productos y Servicios',
      explorer: true,
    })
  );

  app.get(`${basePath}/docs-json`, (req, res) => {
    res.status(200).json(swaggerSpec);
  });
};

export default swaggerSpec;