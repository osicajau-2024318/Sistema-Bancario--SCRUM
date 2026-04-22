import swaggerUi from 'swagger-ui-express';

const BASE_PATH = '/SistemaBancarioAdmin/v1';

const TAGS = [
  {
    name: 'Favoritos',
    description: 'Gestión de cuentas favoritas para transferencias rápidas',
  },
  {
    name: 'Moneda',
    description: 'Conversión de monedas y saldos de cuentas',
  },
];

const AUTH_SECURITY = [{ bearerAuth: [] }, { xTokenAuth: [] }];

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

const FAVORITE_PATHS = {
  [`${BASE_PATH}/favorites`]: {
    post: {
      tags: ['Favoritos'],
      operationId: 'createFavorite',
      summary: 'Crear favorito',
      description: 'Agrega una cuenta a la lista de favoritos del usuario.',
      security: AUTH_SECURITY,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/FavoriteCreateInput' },
            examples: {
              ejemplo: {
                value: {
                  alias: 'Cuenta de mi hermana',
                  account_number: '1234567890123456',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Favorito creado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FavoriteMutationResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    get: {
      tags: ['Favoritos'],
      operationId: 'listFavorites',
      summary: 'Listar favoritos',
      description: 'Lista los favoritos del usuario autenticado.',
      security: AUTH_SECURITY,
      responses: {
        200: {
          description: 'Favoritos obtenidos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FavoriteListResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  [`${BASE_PATH}/favorites/{id}`]: {
    put: {
      tags: ['Favoritos'],
      operationId: 'updateFavorite',
      summary: 'Actualizar favorito',
      description: 'Actualiza el alias de un favorito.',
      security: AUTH_SECURITY,
      parameters: [{ $ref: '#/components/parameters/IdPathParam' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/FavoriteUpdateInput' },
          },
        },
      },
      responses: {
        200: {
          description: 'Favorito actualizado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FavoriteMutationResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/InvalidId' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: {
          description: 'Favorito no encontrado',
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
      tags: ['Favoritos'],
      operationId: 'deleteFavorite',
      summary: 'Eliminar favorito',
      description: 'Elimina un favorito de la lista.',
      security: AUTH_SECURITY,
      parameters: [{ $ref: '#/components/parameters/IdPathParam' }],
      responses: {
        200: {
          description: 'Favorito eliminado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/InvalidId' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: {
          description: 'Favorito no encontrado',
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
  [`${BASE_PATH}/favorites/{id}/transfer`]: {
    post: {
      tags: ['Favoritos'],
      operationId: 'quickTransferFromFavorite',
      summary: 'Transferencia rápida desde favorito',
      description: 'Realiza una transferencia rápida a un favorito.',
      security: AUTH_SECURITY,
      parameters: [{ $ref: '#/components/parameters/IdPathParam' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/QuickTransferInput' },
          },
        },
      },
      responses: {
        200: {
          description: 'Transferencia realizada',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TransactionResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: {
          description: 'Favorito o cuenta no encontrada',
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

const CURRENCY_PATHS = {
  [`${BASE_PATH}/currency/convert`]: {
    get: {
      tags: ['Moneda'],
      operationId: 'convertMoney',
      summary: 'Convertir monto entre monedas',
      description: 'Convierte un monto de una moneda a otra.',
      security: AUTH_SECURITY,
      parameters: [
        {
          in: 'query',
          name: 'from',
          required: true,
          description: 'Código de moneda origen (ej. GTQ)',
          schema: { type: 'string' },
        },
        {
          in: 'query',
          name: 'to',
          required: true,
          description: 'Código de moneda destino (ej. USD)',
          schema: { type: 'string' },
        },
        {
          in: 'query',
          name: 'amount',
          required: true,
          description: 'Monto a convertir',
          schema: { type: 'number' },
        },
      ],
      responses: {
        200: {
          description: 'Conversión realizada',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CurrencyConvertResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  [`${BASE_PATH}/currency/{accountId}`]: {
    get: {
      tags: ['Moneda'],
      operationId: 'convertAccountCurrency',
      summary: 'Convertir saldo de cuenta',
      description: 'Convierte el saldo de una cuenta a otra moneda.',
      security: AUTH_SECURITY,
      parameters: [
        {
          in: 'path',
          name: 'accountId',
          required: true,
          description: 'ID de la cuenta',
          schema: { $ref: '#/components/schemas/MongoId' },
        },
        {
          in: 'query',
          name: 'to',
          required: true,
          description: 'Código de moneda destino (ej. USD)',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Conversión realizada',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AccountCurrencyConvertResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: {
          description: 'Cuenta no encontrada',
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

const COMPONENTS = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Authorization: Bearer <token>',
    },
    xTokenAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'x-token',
      description: 'Alternativa de autenticación con x-token',
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
    SuccessResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operación exitosa' },
      },
    },

    Favorite: {
      type: 'object',
      properties: {
        _id: { $ref: '#/components/schemas/MongoId' },
        alias: { type: 'string', example: 'Cuenta de mi hermana' },
        account_number: { type: 'string', example: '1234567890123456' },
        account_type: { type: 'string', enum: ['AHORRO', 'CORRIENTE', 'NOMINA'] },
        owner_user_id: { type: 'string', example: 'user123' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    FavoriteCreateInput: {
      type: 'object',
      required: ['alias', 'account_number'],
      properties: {
        alias: { type: 'string', minLength: 1, maxLength: 50 },
        account_number: { type: 'string' },
      },
    },
    FavoriteUpdateInput: {
      type: 'object',
      required: ['alias'],
      properties: {
        alias: { type: 'string', minLength: 1, maxLength: 50 },
      },
    },
    FavoriteMutationResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Favorito agregado exitosamente' },
        favorite: { $ref: '#/components/schemas/Favorite' },
      },
    },
    FavoriteListResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        total: { type: 'integer', example: 2 },
        message: { type: 'string', nullable: true },
        favorites: {
          type: 'array',
          items: { $ref: '#/components/schemas/Favorite' },
        },
      },
    },

    QuickTransferInput: {
      type: 'object',
      required: ['amount', 'fromAccount'],
      properties: {
        amount: { type: 'number', minimum: 0.01 },
        fromAccount: { type: 'string', description: 'Número de cuenta origen' },
      },
    },
    TransactionResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Transferencia realizada exitosamente' },
        transaction: { type: 'object' }, // Assuming transaction schema exists
      },
    },

    CurrencyConvertResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        from: { type: 'string', example: 'GTQ' },
        to: { type: 'string', example: 'USD' },
        amount: { type: 'number', example: 100 },
        convertedAmount: { type: 'number', example: 12.5 },
      },
    },
    AccountCurrencyConvertResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        accountId: { type: 'string', example: '67f6f2cf2a1e6b17f34ef001' },
        originalBalance: { type: 'number', example: 1000 },
        originalCurrency: { type: 'string', example: 'GTQ' },
        convertedBalance: { type: 'number', example: 125 },
        convertedCurrency: { type: 'string', example: 'USD' },
      },
    },
  },
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Sistema Bancario API - Favoritos y Moneda',
    description: 'Documentación de Favoritos y Conversión de Moneda.',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local' }],
  tags: TAGS,
  paths: {
    ...FAVORITE_PATHS,
    ...CURRENCY_PATHS,
  },
  components: COMPONENTS,
};

export const registerSwagger = (app, basePath = BASE_PATH) => {
  app.use(
    `${basePath}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Sistema Bancario API Docs',
      explorer: true,
    })
  );

  app.get(`${basePath}/docs-json`, (req, res) => {
    res.status(200).json(swaggerSpec);
  });
};

export default swaggerSpec;