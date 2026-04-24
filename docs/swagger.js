import swaggerUi from 'swagger-ui-express';

const BASE_PATH = '/SistemaBancarioAdmin/v1';

const TAGS = [
  { name: 'Favoritos', description: 'Gestión de cuentas favoritas para transferencias rápidas' },
  { name: 'Moneda', description: 'Conversión de monedas y saldos de cuentas' },
  { name: 'Auth', description: 'Autenticacion, registro y recuperacion de contraseña' },
  { name: 'User', description: 'Gestion de perfil de usuario autenticado' },
  { name: 'Admin', description: 'Administracion de usuarios, clientes y estado de cuentas' },
  { name: 'Role', description: 'Consultas y filtros por rol' },
  { name: 'UserRole', description: 'Asignacion y consulta de roles por usuario' },
  { name: 'Productos', description: 'Gestión de productos del banco' },
  { name: 'Servicios', description: 'Gestión de servicios del banco' },
  { name: 'Transaction', description: 'Operaciones y consultas de transacciones bancarias' },
  { name: 'Deposit', description: 'Depósitos y administración de depósitos pendientes' },
  { name: 'Activity', description: 'Historial de actividad y registros de cuenta' },
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
    // Kevin schemas
    RegisterInput: { type: 'object', required: ['name','surname','username','email','password','dpi','phone','address'], properties: { name: { type: 'string', example: 'Juan' }, surname: { type: 'string', example: 'Garcia' }, username: { type: 'string', example: 'jgarcia01' }, email: { type: 'string', format: 'email', example: 'juan.garcia@correo.com' }, password: { type: 'string', minLength: 8, example: 'SecurePass123!' }, dpi: { type: 'string', example: '9876543210101' }, phone: { type: 'string', example: '50212345678' }, address: { type: 'string', example: 'Zona 1, Ciudad' }, workName: { type: 'string', example: 'Empresa XYZ' }, monthlyIncome: { type: 'number', example: 1500 } } },
    LoginInput: { type: 'object', required: ['email','password'], properties: { email: { type: 'string', format: 'email', example: 'juan.garcia@correo.com' }, password: { type: 'string', example: 'SecurePass123!' } } },
    VerifyEmailInput: { type: 'object', required: ['token'], properties: { token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } } },
    ForgotPasswordInput: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email', example: 'juan.garcia@correo.com' } } },
    ResetPasswordInput: { type: 'object', required: ['token','newPassword','confirmPassword'], properties: { token: { type: 'string' }, newPassword: { type: 'string', minLength: 8 }, confirmPassword: { type: 'string', minLength: 8 } } },
    UpdateProfileInput: { type: 'object', properties: { name: { type: 'string' }, surname: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' }, workName: { type: 'string' }, monthlyIncome: { type: 'number' }, profilePicture: { type: 'string' } } },
    ChangePasswordInput: { type: 'object', required: ['currentPassword','newPassword','confirmPassword'], properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 8 }, confirmPassword: { type: 'string', minLength: 8 } } },
    CreateClientInput: { type: 'object', required: ['name','surname','username','dpi','address','phone','email','password','workName','monthlyIncome'], properties: { name: { type: 'string', example: 'Carlos' }, surname: { type: 'string', example: 'Perez' }, username: { type: 'string', example: 'cperez01' }, dpi: { type: 'string', example: '1234567890101' }, address: { type: 'string', example: 'Zona 10, Guatemala' }, phone: { type: 'string', example: '50255551234' }, email: { type: 'string', format: 'email', example: 'carlos.perez@correo.com' }, password: { type: 'string', minLength: 8, example: 'StrongPass123!' }, workName: { type: 'string', example: 'TechCorp' }, monthlyIncome: { type: 'number', example: 2500 } } },
    UpdateUserInput: { type: 'object', properties: { name: { type: 'string' }, surname: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' }, workName: { type: 'string' }, monthlyIncome: { type: 'number', minimum: 100, example: 3000 } } },
    UpdateUserRoleInput: { type: 'object', required: ['roleName'], properties: { roleName: { type: 'string', example: 'ADMIN' } } },
    UserResponse: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, surname: { type: 'string' }, username: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' }, role: { type: 'string', example: 'USER' }, status: { type: 'boolean' }, isEmailVerified: { type: 'boolean' }, accountState: { type: 'string', example: 'ACTIVA' }, createdAt: { type: 'string', format: 'date-time' } } },
    UserEnvelopeResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/UserResponse' } } },
    UserEnvelopeWithMessageResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, data: { $ref: '#/components/schemas/UserResponse' } } },
    SuccessMessageResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Operacion completada correctamente' } } },
    // Zeta schemas
    Product: { type: 'object', properties: { _id: { $ref: '#/components/schemas/MongoId' }, name: { type: 'string' }, description: { type: 'string' }, type: { type: 'string', enum: ['PRODUCTO','SERVICIO'] }, price: { type: 'number', minimum: 0 }, is_active: { type: 'boolean', default: true }, createdAt: { type: 'string', format: 'date-time' } } },
    ProductCreateInput: { type: 'object', required: ['name','type','price'], properties: { name: { type: 'string' }, description: { type: 'string' }, type: { type: 'string', enum: ['PRODUCTO','SERVICIO'] }, price: { type: 'number', minimum: 0 } } },
    ProductUpdateInput: { type: 'object', minProperties: 1, properties: { name: { type: 'string' }, description: { type: 'string' }, price: { type: 'number', minimum: 0 }, is_active: { type: 'boolean' } } },
    ProductMutationResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, product: { $ref: '#/components/schemas/Product' } } },
    ProductGetResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, product: { $ref: '#/components/schemas/Product' } } },
    ProductListResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, total: { type: 'integer' }, products: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } },
    Service: { type: 'object', properties: { _id: { $ref: '#/components/schemas/MongoId' }, name: { type: 'string' }, description: { type: 'string' }, is_active: { type: 'boolean', default: true }, assigned_to: { type: 'string', nullable: true }, createdAt: { type: 'string', format: 'date-time' } } },
    ServiceCreateInput: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' }, assigned_to: { type: 'string' } } },
    ServiceUpdateInput: { type: 'object', minProperties: 1, properties: { name: { type: 'string' }, description: { type: 'string' }, is_active: { type: 'boolean' }, assigned_to: { type: 'string', nullable: true } } },
    ServiceMutationResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, service: { $ref: '#/components/schemas/Service' } } },
    ServiceGetResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, service: { $ref: '#/components/schemas/Service' } } },
    ServiceListResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, total: { type: 'integer' }, services: { type: 'array', items: { $ref: '#/components/schemas/Service' } } } },
  },
};

// ==================== KEVIN: Auth, User, Admin, Role ====================
const USER_ID_SCHEMA = { type: 'string', minLength: 1, example: 'd6ff04ca-0cf5-40c3-bf4f-f4f7d3bd4d3e' };
const AUTH_SEC = [{ bearerAuth: [] }];
const BASE_API = '/api/v1';

const AUTH_PATHS = {
  [`${BASE_API}/auth/register`]: { post: { tags: ['Auth'], operationId: 'registerUser', summary: 'Registrar nuevo usuario', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } }, responses: { 201: { description: 'Usuario registrado' }, 400: { $ref: '#/components/responses/BadRequest' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_API}/auth/login`]: { post: { tags: ['Auth'], operationId: 'loginUser', summary: 'Iniciar sesion', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } }, responses: { 200: { description: 'Sesion iniciada' }, 400: { $ref: '#/components/responses/BadRequest' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_API}/auth/verify-email`]: { post: { tags: ['Auth'], operationId: 'verifyEmail', summary: 'Verificar correo electronico', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyEmailInput' } } } }, responses: { 200: { description: 'Correo verificado' }, 400: { $ref: '#/components/responses/BadRequest' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_API}/auth/forgot-password`]: { post: { tags: ['Auth'], operationId: 'forgotPassword', summary: 'Solicitar recuperacion de contraseña', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordInput' } } } }, responses: { 200: { description: 'Correo enviado' }, 404: { description: 'Usuario no encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_API}/auth/reset-password`]: { post: { tags: ['Auth'], operationId: 'resetPassword', summary: 'Restablecer contraseña', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordInput' } } } }, responses: { 200: { description: 'Contraseña actualizada' }, 400: { $ref: '#/components/responses/BadRequest' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
};

const USER_PATHS = {
  [`${BASE_API}/users/profile`]: {
    get: { tags: ['User'], operationId: 'getUserProfile', summary: 'Obtener perfil', security: AUTH_SEC, responses: { 200: { description: 'Perfil obtenido', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserEnvelopeResponse' } } } }, 401: { $ref: '#/components/responses/Unauthorized' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
    put: { tags: ['User'], operationId: 'updateUserProfile', summary: 'Actualizar perfil', security: AUTH_SEC, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileInput' } } } }, responses: { 200: { description: 'Perfil actualizado' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
  },
  [`${BASE_API}/users/change-password`]: { post: { tags: ['User'], operationId: 'changePassword', summary: 'Cambiar contraseña', security: AUTH_SEC, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordInput' } } } }, responses: { 200: { description: 'Contraseña cambiada' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
};

const ADMIN_PATHS = {
  [`${BASE_API}/admin/create-client`]: { post: { tags: ['Admin'], operationId: 'createClient', summary: 'Crear cliente', security: AUTH_SEC, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateClientInput' } } } }, responses: { 200: { description: 'Cliente creado' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_API}/admin/users`]: { get: { tags: ['Admin'], operationId: 'getAllUsersAdmin', summary: 'Listar usuarios paginado', security: AUTH_SEC, parameters: [{ in: 'query', name: 'page', schema: { type: 'integer', default: 1 } }, { in: 'query', name: 'pageSize', schema: { type: 'integer', default: 10 } }, { in: 'query', name: 'searchTerm', schema: { type: 'string' } }, { in: 'query', name: 'role', schema: { type: 'string' } }], responses: { 200: { description: 'Usuarios obtenidos' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_API}/admin/users/{userId}`]: {
    get: { tags: ['Admin'], operationId: 'getUserByIdAdmin', summary: 'Obtener usuario por ID', security: AUTH_SEC, parameters: [{ in: 'path', name: 'userId', required: true, schema: USER_ID_SCHEMA }], responses: { 200: { description: 'Usuario encontrado' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { description: 'No encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
    put: { tags: ['Admin'], operationId: 'updateUserAdmin', summary: 'Actualizar usuario', security: AUTH_SEC, parameters: [{ in: 'path', name: 'userId', required: true, schema: USER_ID_SCHEMA }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserInput' } } } }, responses: { 200: { description: 'Usuario actualizado' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
    delete: { tags: ['Admin'], operationId: 'deleteUserAdmin', summary: 'Eliminar usuario', security: AUTH_SEC, parameters: [{ in: 'path', name: 'userId', required: true, schema: USER_ID_SCHEMA }], responses: { 200: { description: 'Operacion completada' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { description: 'No encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
  },
  [`${BASE_API}/admin/users/{userId}/activate`]: { post: { tags: ['Admin'], operationId: 'activateUserAccount', summary: 'Activar cuenta de usuario', security: AUTH_SEC, parameters: [{ in: 'path', name: 'userId', required: true, schema: USER_ID_SCHEMA }], responses: { 200: { description: 'Cuenta activada' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { description: 'No encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
};

const USER_ROLE_PATHS = {
  [`${BASE_API}/Users/{userId}/role`]: { put: { tags: ['UserRole'], operationId: 'updateUserRole', summary: 'Actualizar rol de usuario', security: AUTH_SEC, parameters: [{ in: 'path', name: 'userId', required: true, schema: USER_ID_SCHEMA }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRoleInput' } } } }, responses: { 200: { description: 'Rol actualizado' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_API}/Users/{userId}/roles`]: { get: { tags: ['Role'], operationId: 'getUserRoles', summary: 'Obtener roles de un usuario', security: AUTH_SEC, parameters: [{ in: 'path', name: 'userId', required: true, schema: USER_ID_SCHEMA }], responses: { 200: { description: 'Roles obtenidos' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { description: 'No encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_API}/Users/by-role/{roleName}`]: { get: { tags: ['Role'], operationId: 'getUsersByRole', summary: 'Listar usuarios por rol', security: AUTH_SEC, parameters: [{ in: 'path', name: 'roleName', required: true, schema: { type: 'string', example: 'ADMIN' } }], responses: { 200: { description: 'Usuarios filtrados por rol' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
};

// ==================== ZETA: Productos y Servicios ====================
const PRODUCT_PATHS = {
  [`${BASE_PATH}/products`]: {
    post: { tags: ['Productos'], operationId: 'createProduct', summary: 'Crear producto', security: AUTH_SECURITY, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductCreateInput' }, examples: { ejemplo: { value: { name: 'Cuenta de Ahorros Premium', description: 'Cuenta con intereses altos', type: 'PRODUCTO', price: 0 } } } } } }, responses: { 201: { description: 'Producto creado' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
    get: { tags: ['Productos'], operationId: 'listProducts', summary: 'Listar productos', parameters: [{ in: 'query', name: 'type', schema: { type: 'string', enum: ['PRODUCTO', 'SERVICIO'] } }, { in: 'query', name: 'is_active', schema: { type: 'boolean' } }], responses: { 200: { description: 'Productos obtenidos' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
  },
  [`${BASE_PATH}/products/{id}`]: {
    get: { tags: ['Productos'], operationId: 'getProductById', summary: 'Obtener producto por ID', parameters: [{ $ref: '#/components/parameters/IdPathParam' }], responses: { 200: { description: 'Producto encontrado' }, 400: { $ref: '#/components/responses/InvalidId' }, 404: { description: 'Producto no encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
    put: { tags: ['Productos'], operationId: 'updateProductById', summary: 'Actualizar producto por ID', security: AUTH_SECURITY, parameters: [{ $ref: '#/components/parameters/IdPathParam' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductUpdateInput' } } } }, responses: { 200: { description: 'Producto actualizado' }, 400: { $ref: '#/components/responses/InvalidId' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { description: 'Producto no encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
    delete: { tags: ['Productos'], operationId: 'deleteProductById', summary: 'Eliminar producto', security: AUTH_SECURITY, parameters: [{ $ref: '#/components/parameters/IdPathParam' }], responses: { 200: { description: 'Producto eliminado' }, 400: { $ref: '#/components/responses/InvalidId' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { description: 'Producto no encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
  },
};

const SERVICE_PATHS = {
  [`${BASE_PATH}/services`]: {
    post: { tags: ['Servicios'], operationId: 'createService', summary: 'Crear servicio', security: AUTH_SECURITY, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceCreateInput' } } } }, responses: { 201: { description: 'Servicio creado' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
    get: { tags: ['Servicios'], operationId: 'listServices', summary: 'Listar servicios', security: AUTH_SECURITY, parameters: [{ in: 'query', name: 'is_active', schema: { type: 'boolean' } }, { in: 'query', name: 'assigned_to', schema: { $ref: '#/components/schemas/MongoId' } }], responses: { 200: { description: 'Servicios obtenidos' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
  },
  [`${BASE_PATH}/services/{id}`]: {
    get: { tags: ['Servicios'], operationId: 'getServiceById', summary: 'Obtener servicio por ID', security: AUTH_SECURITY, parameters: [{ $ref: '#/components/parameters/IdPathParam' }], responses: { 200: { description: 'Servicio encontrado' }, 400: { $ref: '#/components/responses/InvalidId' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { description: 'Servicio no encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
    put: { tags: ['Servicios'], operationId: 'updateServiceById', summary: 'Actualizar servicio por ID', security: AUTH_SECURITY, parameters: [{ $ref: '#/components/parameters/IdPathParam' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceUpdateInput' } } } }, responses: { 200: { description: 'Servicio actualizado' }, 400: { $ref: '#/components/responses/InvalidId' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { description: 'Servicio no encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
    delete: { tags: ['Servicios'], operationId: 'deleteServiceById', summary: 'Eliminar servicio', security: AUTH_SECURITY, parameters: [{ $ref: '#/components/parameters/IdPathParam' }], responses: { 200: { description: 'Servicio eliminado' }, 400: { $ref: '#/components/responses/InvalidId' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { description: 'Servicio no encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } },
  },
};

// ==================== EDDY: Transactions, Deposits, Activity ====================
const TRANSACTION_PATHS = {
  [`${BASE_PATH}/transactions/deposit`]: { post: { tags: ['Deposit'], operationId: 'createTransactionDeposit', summary: 'Crear depósito en una cuenta', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { accountNumber: { type: 'string', example: '1234567890' }, amount: { type: 'number', example: 1200 }, currency: { type: 'string', example: 'GTQ' }, description: { type: 'string', example: 'Depósito en ventanilla' } } } } } }, responses: { 201: { description: 'Depósito creado' }, 400: { $ref: '#/components/responses/BadRequest' }, 404: { description: 'Cuenta no encontrada' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_PATH}/transactions/my-transactions`]: { get: { tags: ['Transaction'], operationId: 'getMyTransactions', summary: 'Obtener transacciones propias', security: AUTH_SECURITY, parameters: [{ in: 'query', name: 'page', schema: { type: 'integer', default: 1 } }, { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } }, { in: 'query', name: 'type', schema: { type: 'string' } }, { in: 'query', name: 'from_date', schema: { type: 'string', format: 'date' } }, { in: 'query', name: 'to_date', schema: { type: 'string', format: 'date' } }], responses: { 200: { description: 'Lista de transacciones' }, 401: { $ref: '#/components/responses/Unauthorized' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_PATH}/transactions/all`]: { get: { tags: ['Transaction'], operationId: 'getAllTransactions', summary: 'Obtener todas las transacciones (admin)', security: AUTH_SECURITY, responses: { 200: { description: 'Lista de transacciones' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_PATH}/transactions/{id}`]: { get: { tags: ['Transaction'], operationId: 'getTransactionById', summary: 'Obtener transacción por ID', security: AUTH_SECURITY, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Detalle de transacción' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { description: 'No encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
};

const DEPOSIT_PATHS = {
  [`${BASE_PATH}/deposits`]: { post: { tags: ['Deposit'], operationId: 'createDeposit', summary: 'Registrar un depósito', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { accountNumber: { type: 'string' }, amount: { type: 'number' } } } } } }, responses: { 201: { description: 'Depósito creado' }, 400: { $ref: '#/components/responses/BadRequest' }, 404: { description: 'Cuenta no encontrada' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_PATH}/deposits/pending`]: { get: { tags: ['Deposit'], operationId: 'getPendingDeposits', summary: 'Obtener depósitos pendientes', security: AUTH_SECURITY, responses: { 200: { description: 'Depósitos pendientes' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_PATH}/deposits/revert`]: { post: { tags: ['Deposit'], operationId: 'revertDeposit', summary: 'Revertir un depósito', security: AUTH_SECURITY, requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { transactionId: { type: 'string' } } } } } }, responses: { 200: { description: 'Depósito revertido' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_PATH}/deposits/{id}`]: { put: { tags: ['Deposit'], operationId: 'updateDeposit', summary: 'Actualizar monto de depósito', security: AUTH_SECURITY, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { amount: { type: 'number' } } } } } }, responses: { 200: { description: 'Depósito actualizado' }, 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { description: 'No encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
};

const ACTIVITY_PATHS = {
  [`${BASE_PATH}/transactions/history/me`]: { get: { tags: ['Activity'], operationId: 'getOwnActivityHistory', summary: 'Historial de actividad propia', security: AUTH_SECURITY, responses: { 200: { description: 'Historial de actividad' }, 401: { $ref: '#/components/responses/Unauthorized' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
  [`${BASE_PATH}/transactions/history/{accountId}`]: { get: { tags: ['Activity'], operationId: 'getAccountActivityHistory', summary: 'Historial de actividad por cuenta', security: AUTH_SECURITY, parameters: [{ in: 'path', name: 'accountId', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Historial de actividad por cuenta' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { description: 'No encontrado' }, 500: { $ref: '#/components/responses/InternalServerError' } } } },
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Sistema Bancario API - Documentación Completa',
    description: 'Documentación unificada de todos los endpoints del Sistema Bancario.',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local' }],
  tags: TAGS,
  paths: {
    ...FAVORITE_PATHS,
    ...CURRENCY_PATHS,
    ...AUTH_PATHS,
    ...USER_PATHS,
    ...ADMIN_PATHS,
    ...USER_ROLE_PATHS,
    ...PRODUCT_PATHS,
    ...SERVICE_PATHS,
    ...TRANSACTION_PATHS,
    ...DEPOSIT_PATHS,
    ...ACTIVITY_PATHS,
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