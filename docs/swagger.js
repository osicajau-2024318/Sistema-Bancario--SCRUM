'use strict';

import swaggerUi from 'swagger-ui-express';

const BASE_PATH = '/api/v1';

const TAGS = [
	{
		name: 'Admin',
		description: 'Administracion de usuarios, clientes y estado de cuentas',
	},
	{
		name: 'Role',
		description: 'Consultas y filtros por rol',
	},
	{
		name: 'UserRole',
		description: 'Asignacion y consulta de roles por usuario',
	},
];

const AUTH_SECURITY = [{ bearerAuth: [] }];

const USER_ID_SCHEMA = {
	type: 'string',
	minLength: 1,
	example: 'd6ff04ca-0cf5-40c3-bf4f-f4f7d3bd4d3e',
};

const COMMON_RESPONSES = {
	BadRequest: {
		description: 'Solicitud invalida',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/ErrorResponse' },
				example: {
					success: false,
					message: 'Datos de entrada invalidos',
					error: 'VALIDATION_ERROR',
				},
			},
		},
	},
	Unauthorized: {
		description: 'Token faltante, expirado o invalido',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/AuthErrorResponse' },
				example: {
					success: false,
					message: 'Usuario no autenticado',
					error: 'UNAUTHORIZED',
				},
			},
		},
	},
	Forbidden: {
		description: 'El rol no tiene permiso para esta operacion',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/ErrorResponse' },
				example: {
					success: false,
					message: 'Forbidden',
					error: 'FORBIDDEN',
				},
			},
		},
	},
	NotFound: {
		description: 'Recurso no encontrado',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/ErrorResponse' },
				example: {
					success: false,
					message: 'Usuario no encontrado',
					error: 'NOT_FOUND',
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

const ADMIN_PATHS = {
	[`${BASE_PATH}/admin/create-client`]: {
		post: {
			tags: ['Admin'],
			operationId: 'createClient',
			summary: 'Crear cliente',
			description: 'Crea un nuevo usuario cliente. Requiere rol ADMIN.',
			security: AUTH_SECURITY,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/CreateClientInput' },
						examples: {
							ejemplo: {
								value: {
									name: 'Carlos',
									surname: 'Perez',
									username: 'cperez01',
									dpi: '1234567890101',
									address: 'Zona 10, Guatemala',
									phone: '50255551234',
									email: 'carlos.perez@correo.com',
									password: 'StrongPass123!',
									workName: 'TechCorp',
									monthlyIncome: 2500,
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Cliente creado correctamente',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/UserEnvelopeResponse' },
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/admin/users`]: {
		get: {
			tags: ['Admin'],
			operationId: 'getAllUsersAdmin',
			summary: 'Listar usuarios (paginado)',
			description: 'Lista usuarios con paginacion y filtros opcionales por termino y rol.',
			security: AUTH_SECURITY,
			parameters: [
				{
					in: 'query',
					name: 'page',
					required: false,
					description: 'Numero de pagina. Valor por defecto: 1.',
					schema: { type: 'integer', minimum: 1, default: 1 },
				},
				{
					in: 'query',
					name: 'pageSize',
					required: false,
					description: 'Tamano de pagina. Valor por defecto: 10.',
					schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
				},
				{
					in: 'query',
					name: 'searchTerm',
					required: false,
					description: 'Busqueda opcional por nombre, usuario, correo u otros campos.',
					schema: { type: 'string', example: 'carlos' },
				},
				{
					in: 'query',
					name: 'role',
					required: false,
					description: 'Filtro opcional por rol.',
					schema: { type: 'string', example: 'ADMIN' },
				},
			],
			responses: {
				200: {
					description: 'Usuarios obtenidos',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/PagedUsersEnvelopeResponse' },
						},
					},
				},
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/admin/users/{userId}`]: {
		get: {
			tags: ['Admin'],
			operationId: 'getUserByIdAdmin',
			summary: 'Obtener usuario por ID',
			description: 'Retorna el detalle de un usuario por su identificador.',
			security: AUTH_SECURITY,
			parameters: [{ $ref: '#/components/parameters/UserIdPathParam' }],
			responses: {
				200: {
					description: 'Usuario encontrado',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/UserEnvelopeResponse' },
						},
					},
				},
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
		put: {
			tags: ['Admin'],
			operationId: 'updateUserAdmin',
			summary: 'Actualizar usuario',
			description: 'Actualiza campos permitidos del usuario. Requiere rol ADMIN.',
			security: AUTH_SECURITY,
			parameters: [{ $ref: '#/components/parameters/UserIdPathParam' }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UpdateUserInput' },
						examples: {
							ejemplo: {
								value: {
									name: 'Carlos Alberto',
									surname: 'Perez Lopez',
									address: 'Zona 14, Guatemala',
									phone: '50255550001',
									workName: 'Nueva Empresa',
									monthlyIncome: 3200,
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Usuario actualizado',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/UserEnvelopeWithMessageResponse' },
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
		delete: {
			tags: ['Admin'],
			operationId: 'deleteUserAdmin',
			summary: 'Desactivar o eliminar usuario',
			description:
				'Elimina o desactiva al usuario segun la implementacion del servicio. Requiere rol ADMIN.',
			security: AUTH_SECURITY,
			parameters: [{ $ref: '#/components/parameters/UserIdPathParam' }],
			responses: {
				200: {
					description: 'Operacion completada',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
							example: {
								success: true,
								message: 'Usuario eliminado correctamente',
							},
						},
					},
				},
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/admin/users/{userId}/activate`]: {
		post: {
			tags: ['Admin'],
			operationId: 'activateUserAccount',
			summary: 'Activar cuenta de usuario',
			description: 'Activa una cuenta de usuario y marca correo verificado. Requiere rol ADMIN.',
			security: AUTH_SECURITY,
			parameters: [{ $ref: '#/components/parameters/UserIdPathParam' }],
			responses: {
				200: {
					description: 'Cuenta activada',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/UserEnvelopeWithMessageResponse' },
							example: {
								success: true,
								message: 'Cuenta activada correctamente',
								data: {
									id: 'd6ff04ca-0cf5-40c3-bf4f-f4f7d3bd4d3e',
									name: 'Carlos',
									surname: 'Perez',
									username: 'cperez01',
									email: 'carlos.perez@correo.com',
									profilePicture: '',
									phone: '50255551234',
									address: 'Zona 10, Guatemala',
									dpi: '1234567890101',
									workName: 'TechCorp',
									monthlyIncome: 2500,
									role: 'USER',
									status: true,
									isEmailVerified: true,
									accountState: 'ACTIVA',
									createdAt: '2026-04-21T12:00:00Z',
									updatedAt: '2026-04-21T12:00:00Z',
								},
							},
						},
					},
				},
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
};

const USER_ROLE_PATHS = {
	[`${BASE_PATH}/Users/{userId}/role`]: {
		put: {
			tags: ['UserRole'],
			operationId: 'updateUserRole',
			summary: 'Actualizar rol de usuario',
			description: 'Cambia el rol principal del usuario. Requiere rol ADMIN.',
			security: AUTH_SECURITY,
			parameters: [{ $ref: '#/components/parameters/UserIdPathParam' }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UpdateUserRoleInput' },
						examples: {
							ejemplo: {
								value: {
									roleName: 'ADMIN',
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Rol actualizado',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/UserResponse' },
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/Users/{userId}/roles`]: {
		get: {
			tags: ['Role'],
			operationId: 'getUserRoles',
			summary: 'Obtener roles de un usuario',
			description: 'Retorna la lista de roles asociados al usuario.',
			security: AUTH_SECURITY,
			parameters: [{ $ref: '#/components/parameters/UserIdPathParam' }],
			responses: {
				200: {
					description: 'Roles obtenidos',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/UserRolesResponse' },
							example: ['ADMIN', 'USER'],
						},
					},
				},
				401: { $ref: '#/components/responses/Unauthorized' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/Users/by-role/{roleName}`]: {
		get: {
			tags: ['Role'],
			operationId: 'getUsersByRole',
			summary: 'Listar usuarios por rol',
			description: 'Retorna usuarios que pertenecen a un rol especifico. Requiere rol ADMIN.',
			security: AUTH_SECURITY,
			parameters: [
				{
					in: 'path',
					name: 'roleName',
					required: true,
					description: 'Nombre del rol a filtrar.',
					schema: {
						type: 'string',
						example: 'ADMIN',
					},
				},
			],
			responses: {
				200: {
					description: 'Usuarios filtrados por rol',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: { $ref: '#/components/schemas/UserResponse' },
							},
						},
					},
				},
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
};

export const swaggerSpec = {
	openapi: '3.0.3',
	info: {
		title: 'Sistema Bancario - Administracion de Usuarios y Roles',
		version: '1.0.0',
		description:
			'Documentacion de endpoints para administracion de usuarios, asignacion de roles y activacion/desactivacion de cuentas.',
	},
	servers: [
		{
			url: 'http://localhost:3000',
			description: 'Servidor local',
		},
	],
	tags: TAGS,
	paths: {
		...ADMIN_PATHS,
		...USER_ROLE_PATHS,
	},
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'Token JWT enviado en Authorization: Bearer <token>',
			},
		},
		parameters: {
			UserIdPathParam: {
				in: 'path',
				name: 'userId',
				required: true,
				description: 'Identificador unico del usuario.',
				schema: USER_ID_SCHEMA,
			},
		},
		responses: COMMON_RESPONSES,
		schemas: {
			ErrorResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: false },
					message: { type: 'string', example: 'Error de negocio' },
					error: { type: 'string', example: 'BUSINESS_ERROR' },
				},
				required: ['success', 'message'],
			},
			AuthErrorResponse: {
				allOf: [{ $ref: '#/components/schemas/ErrorResponse' }],
			},
			CreateClientInput: {
				type: 'object',
				properties: {
					name: { type: 'string', example: 'Carlos' },
					surname: { type: 'string', example: 'Perez' },
					username: { type: 'string', example: 'cperez01' },
					dpi: { type: 'string', example: '1234567890101' },
					address: { type: 'string', example: 'Zona 10, Guatemala' },
					phone: { type: 'string', example: '50255551234' },
					email: { type: 'string', format: 'email', example: 'carlos.perez@correo.com' },
					password: { type: 'string', minLength: 8, example: 'StrongPass123!' },
					workName: { type: 'string', example: 'TechCorp' },
					monthlyIncome: { type: 'number', format: 'decimal', minimum: 100, example: 2500 },
				},
				required: [
					'name',
					'surname',
					'username',
					'dpi',
					'address',
					'phone',
					'email',
					'password',
					'workName',
					'monthlyIncome',
				],
			},
			UpdateUserInput: {
				type: 'object',
				properties: {
					name: { type: 'string', nullable: true },
					surname: { type: 'string', nullable: true },
					address: { type: 'string', nullable: true },
					phone: { type: 'string', nullable: true },
					workName: { type: 'string', nullable: true },
					monthlyIncome: {
						type: 'number',
						format: 'decimal',
						nullable: true,
						minimum: 100,
						example: 3000,
					},
				},
			},
			UpdateUserRoleInput: {
				type: 'object',
				properties: {
					roleName: {
						type: 'string',
						example: 'ADMIN',
						description: 'Nombre del rol destino para el usuario.',
					},
				},
				required: ['roleName'],
			},
			UserResponse: {
				type: 'object',
				properties: {
					id: USER_ID_SCHEMA,
					name: { type: 'string', example: 'Carlos' },
					surname: { type: 'string', example: 'Perez' },
					username: { type: 'string', example: 'cperez01' },
					email: { type: 'string', format: 'email', example: 'carlos.perez@correo.com' },
					profilePicture: { type: 'string', example: '' },
					phone: { type: 'string', example: '50255551234' },
					address: { type: 'string', example: 'Zona 10, Guatemala' },
					dpi: { type: 'string', example: '1234567890101' },
					workName: { type: 'string', example: 'TechCorp' },
					monthlyIncome: { type: 'number', format: 'decimal', example: 2500 },
					role: { type: 'string', example: 'USER' },
					status: { type: 'boolean', example: true },
					isEmailVerified: { type: 'boolean', example: true },
					accountState: { type: 'string', example: 'ACTIVA' },
					createdAt: { type: 'string', format: 'date-time' },
					updatedAt: { type: 'string', format: 'date-time' },
				},
			},
			PagedUsers: {
				type: 'object',
				properties: {
					items: {
						type: 'array',
						items: { $ref: '#/components/schemas/UserResponse' },
					},
					totalCount: { type: 'integer', example: 45 },
					page: { type: 'integer', example: 1 },
					pageSize: { type: 'integer', example: 10 },
					totalPages: { type: 'integer', example: 5 },
					hasPreviousPage: { type: 'boolean', example: false },
					hasNextPage: { type: 'boolean', example: true },
				},
			},
			UserEnvelopeResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					data: { $ref: '#/components/schemas/UserResponse' },
				},
			},
			UserEnvelopeWithMessageResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					message: { type: 'string', example: 'Operacion completada correctamente' },
					data: { $ref: '#/components/schemas/UserResponse' },
				},
			},
			PagedUsersEnvelopeResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					data: { $ref: '#/components/schemas/PagedUsers' },
				},
			},
			SuccessMessageResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					message: { type: 'string', example: 'Operacion completada correctamente' },
				},
			},
			UserRolesResponse: {
				type: 'array',
				items: { type: 'string', example: 'USER' },
			},
		},
	},
};

export const setupSwaggerDocs = (app, options = {}) => {
	const route = options.route || '/docs';
	const customSiteTitle =
		options.customSiteTitle || 'Sistema Bancario - Admin, Role, UserRole Docs';
	const swaggerHandler = swaggerUi.setup(swaggerSpec, { customSiteTitle });

	app.get(`${route}.json`, (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});

	app.use(route, swaggerUi.serve);
	app.get(route, swaggerHandler);
	app.get(`${route}/`, swaggerHandler);
};

