'use strict';

import swaggerUi from 'swagger-ui-express';

const BASE_PATH = '/api/v1';

const TAGS = [
	{
		name: 'Auth',
		description: 'Autenticacion, registro y recuperacion de contraseña',
	},
	{
		name: 'User',
		description: 'Gestion de perfil de usuario autenticado',
	},
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
	Conflict: {
		description: 'El recurso ya existe',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/ErrorResponse' },
				example: {
					success: false,
					message: 'El correo ya esta registrado',
					error: 'CONFLICT',
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

const AUTH_PATHS = {
	[`${BASE_PATH}/auth/register`]: {
		post: {
			tags: ['Auth'],
			operationId: 'registerUser',
			summary: 'Registrar nuevo usuario',
			description: 'Crea una nueva cuenta de usuario. El correo debe ser verificado posteriormente.',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/RegisterInput' },
						examples: {
							ejemplo: {
								value: {
									name: 'Juan',
									surname: 'Garcia',
									username: 'jgarcia01',
									email: 'juan.garcia@correo.com',
									password: 'SecurePass123!',
									dpi: '9876543210101',
									phone: '50212345678',
									address: 'Zona 1, Ciudad',
									workName: 'Empresa XYZ',
									monthlyIncome: 1500,
								},
							},
						},
					},
				},
			},
			responses: {
				201: {
					description: 'Usuario registrado exitosamente',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/AuthEnvelopeResponse' },
							example: {
								success: true,
								message: 'Usuario registrado correctamente. Verifica tu correo.',
								data: {
									id: 'd6ff04ca-0cf5-40c3-bf4f-f4f7d3bd4d3e',
									name: 'Juan',
									surname: 'Garcia',
									email: 'juan.garcia@correo.com',
									username: 'jgarcia01',
									role: 'USER',
									isEmailVerified: false,
									createdAt: '2026-04-23T10:30:00Z',
								},
							},
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				409: { $ref: '#/components/responses/Conflict' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/auth/login`]: {
		post: {
			tags: ['Auth'],
			operationId: 'loginUser',
			summary: 'Iniciar sesion',
			description: 'Autentica un usuario con correo y contraseña. Retorna un token JWT.',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/LoginInput' },
						examples: {
							ejemplo: {
								value: {
									email: 'juan.garcia@correo.com',
									password: 'SecurePass123!',
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Sesion iniciada correctamente',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/LoginResponse' },
							example: {
								success: true,
								message: 'Sesion iniciada correctamente',
								data: {
									id: 'd6ff04ca-0cf5-40c3-bf4f-f4f7d3bd4d3e',
									name: 'Juan',
									surname: 'Garcia',
									email: 'juan.garcia@correo.com',
									username: 'jgarcia01',
									role: 'USER',
									token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
								},
							},
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				401: {
					description: 'Credenciales invalidas',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' },
							example: {
								success: false,
								message: 'Correo o contraseña incorrecta',
								error: 'INVALID_CREDENTIALS',
							},
						},
					},
				},
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/auth/verify-email`]: {
		post: {
			tags: ['Auth'],
			operationId: 'verifyEmail',
			summary: 'Verificar correo electronico',
			description: 'Verifica la direccion de correo usando un token enviado por correo.',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/VerifyEmailInput' },
						examples: {
							ejemplo: {
								value: {
									token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Correo verificado exitosamente',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
							example: {
								success: true,
								message: 'Correo verificado correctamente',
							},
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				404: {
					description: 'Token invalido o expirado',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' },
							example: {
								success: false,
								message: 'Token invalido o expirado',
								error: 'INVALID_TOKEN',
							},
						},
					},
				},
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/auth/forgot-password`]: {
		post: {
			tags: ['Auth'],
			operationId: 'forgotPassword',
			summary: 'Solicitar recuperacion de contraseña',
			description:
				'Envía un correo con instrucciones para recuperar la contraseña. Genera un token temporal.',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ForgotPasswordInput' },
						examples: {
							ejemplo: {
								value: {
									email: 'juan.garcia@correo.com',
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Correo de recuperacion enviado',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
							example: {
								success: true,
								message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña',
							},
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				404: {
					description: 'Usuario no encontrado',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' },
							example: {
								success: false,
								message: 'No existe una cuenta con este correo',
								error: 'USER_NOT_FOUND',
							},
						},
					},
				},
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/auth/reset-password`]: {
		post: {
			tags: ['Auth'],
			operationId: 'resetPassword',
			summary: 'Restablecer contraseña',
			description: 'Actualiza la contraseña del usuario usando el token de recuperacion.',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ResetPasswordInput' },
						examples: {
							ejemplo: {
								value: {
									token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
									newPassword: 'NewSecurePass456!',
									confirmPassword: 'NewSecurePass456!',
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Contraseña actualizada exitosamente',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
							example: {
								success: true,
								message: 'Contraseña actualizada correctamente',
							},
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				401: {
					description: 'Las contraseñas no coinciden',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' },
							example: {
								success: false,
								message: 'Las contraseñas no coinciden',
								error: 'PASSWORD_MISMATCH',
							},
						},
					},
				},
				404: {
					description: 'Token invalido o expirado',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' },
							example: {
								success: false,
								message: 'Token invalido o expirado',
								error: 'INVALID_TOKEN',
							},
						},
					},
				},
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
};

const USER_PATHS = {
	[`${BASE_PATH}/users/profile`]: {
		get: {
			tags: ['User'],
			operationId: 'getUserProfile',
			summary: 'Obtener perfil de usuario',
			description: 'Retorna la informacion del perfil del usuario autenticado.',
			security: AUTH_SECURITY,
			responses: {
				200: {
					description: 'Perfil del usuario obtenido',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/UserEnvelopeResponse' },
							example: {
								success: true,
								data: {
									id: 'd6ff04ca-0cf5-40c3-bf4f-f4f7d3bd4d3e',
									name: 'Juan',
									surname: 'Garcia',
									email: 'juan.garcia@correo.com',
									username: 'jgarcia01',
									profilePicture: '',
									phone: '50212345678',
									address: 'Zona 1, Ciudad',
									dpi: '9876543210101',
									workName: 'Empresa XYZ',
									monthlyIncome: 1500,
									role: 'USER',
									status: true,
									isEmailVerified: true,
									accountState: 'ACTIVA',
									createdAt: '2026-04-23T10:30:00Z',
									updatedAt: '2026-04-23T10:30:00Z',
								},
							},
						},
					},
				},
				401: { $ref: '#/components/responses/Unauthorized' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
		put: {
			tags: ['User'],
			operationId: 'updateUserProfile',
			summary: 'Actualizar perfil de usuario',
			description: 'Actualiza la informacion del perfil del usuario autenticado.',
			security: AUTH_SECURITY,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UpdateProfileInput' },
						examples: {
							ejemplo: {
								value: {
									name: 'Juan Carlos',
									surname: 'Garcia Lopez',
									phone: '50287654321',
									address: 'Zona 2, Ciudad',
									workName: 'Empresa ABC',
									monthlyIncome: 2000,
									profilePicture: 'https://example.com/image.jpg',
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Perfil actualizado correctamente',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/UserEnvelopeWithMessageResponse' },
							example: {
								success: true,
								message: 'Perfil actualizado correctamente',
								data: {
									id: 'd6ff04ca-0cf5-40c3-bf4f-f4f7d3bd4d3e',
									name: 'Juan Carlos',
									surname: 'Garcia Lopez',
									email: 'juan.garcia@correo.com',
									username: 'jgarcia01',
									profilePicture: 'https://example.com/image.jpg',
									phone: '50287654321',
									address: 'Zona 2, Ciudad',
									dpi: '9876543210101',
									workName: 'Empresa ABC',
									monthlyIncome: 2000,
									role: 'USER',
									status: true,
									isEmailVerified: true,
									accountState: 'ACTIVA',
									createdAt: '2026-04-23T10:30:00Z',
									updatedAt: '2026-04-23T11:45:00Z',
								},
							},
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				401: { $ref: '#/components/responses/Unauthorized' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},

	[`${BASE_PATH}/users/change-password`]: {
		post: {
			tags: ['User'],
			operationId: 'changePassword',
			summary: 'Cambiar contraseña',
			description: 'Permite que el usuario autenticado cambie su contraseña.',
			security: AUTH_SECURITY,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ChangePasswordInput' },
						examples: {
							ejemplo: {
								value: {
									currentPassword: 'SecurePass123!',
									newPassword: 'NewSecurePass456!',
									confirmPassword: 'NewSecurePass456!',
								},
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Contraseña cambiada correctamente',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
							example: {
								success: true,
								message: 'Contraseña cambiada correctamente',
							},
						},
					},
				},
				400: { $ref: '#/components/responses/BadRequest' },
				401: {
					description: 'Contraseña actual incorrecta',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ErrorResponse' },
							example: {
								success: false,
								message: 'La contraseña actual es incorrecta',
								error: 'INVALID_PASSWORD',
							},
						},
					},
				},
				500: { $ref: '#/components/responses/InternalServerError' },
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
		title: 'Sistema Bancario - API de Autenticacion, Usuarios y Administracion',
		version: '1.0.0',
		description:
			'Documentacion completa de endpoints para autenticacion, gestion de perfiles de usuario, administracion de usuarios, asignacion de roles y activacion/desactivacion de cuentas.',
	},
	servers: [
		{
			url: 'http://localhost:3000',
			description: 'Servidor local',
		},
	],
	tags: TAGS,
	paths: {
		...AUTH_PATHS,
		...USER_PATHS,
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
			RegisterInput: {
				type: 'object',
				properties: {
					name: { type: 'string', minLength: 1, example: 'Juan' },
					surname: { type: 'string', minLength: 1, example: 'Garcia' },
					username: { type: 'string', minLength: 3, example: 'jgarcia01' },
					email: { type: 'string', format: 'email', example: 'juan.garcia@correo.com' },
					password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
					dpi: { type: 'string', minLength: 13, example: '9876543210101' },
					phone: { type: 'string', example: '50212345678' },
					address: { type: 'string', example: 'Zona 1, Ciudad' },
					workName: { type: 'string', example: 'Empresa XYZ' },
					monthlyIncome: { type: 'number', format: 'decimal', minimum: 0, example: 1500 },
				},
				required: ['name', 'surname', 'username', 'email', 'password', 'dpi', 'phone', 'address'],
			},
			LoginInput: {
				type: 'object',
				properties: {
					email: { type: 'string', format: 'email', example: 'juan.garcia@correo.com' },
					password: { type: 'string', example: 'SecurePass123!' },
				},
				required: ['email', 'password'],
			},
			VerifyEmailInput: {
				type: 'object',
				properties: {
					token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
				},
				required: ['token'],
			},
			ForgotPasswordInput: {
				type: 'object',
				properties: {
					email: { type: 'string', format: 'email', example: 'juan.garcia@correo.com' },
				},
				required: ['email'],
			},
			ResetPasswordInput: {
				type: 'object',
				properties: {
					token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
					newPassword: { type: 'string', minLength: 8, example: 'NewSecurePass456!' },
					confirmPassword: { type: 'string', minLength: 8, example: 'NewSecurePass456!' },
				},
				required: ['token', 'newPassword', 'confirmPassword'],
			},
			UpdateProfileInput: {
				type: 'object',
				properties: {
					name: { type: 'string', nullable: true, example: 'Juan Carlos' },
					surname: { type: 'string', nullable: true, example: 'Garcia Lopez' },
					phone: { type: 'string', nullable: true, example: '50287654321' },
					address: { type: 'string', nullable: true, example: 'Zona 2, Ciudad' },
					workName: { type: 'string', nullable: true, example: 'Empresa ABC' },
					monthlyIncome: { type: 'number', format: 'decimal', nullable: true, minimum: 0, example: 2000 },
					profilePicture: { type: 'string', nullable: true, example: 'https://example.com/image.jpg' },
				},
			},
			ChangePasswordInput: {
				type: 'object',
				properties: {
					currentPassword: { type: 'string', example: 'SecurePass123!' },
					newPassword: { type: 'string', minLength: 8, example: 'NewSecurePass456!' },
					confirmPassword: { type: 'string', minLength: 8, example: 'NewSecurePass456!' },
				},
				required: ['currentPassword', 'newPassword', 'confirmPassword'],
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
			AuthEnvelopeResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					message: { type: 'string', example: 'Usuario registrado correctamente' },
					data: {
						type: 'object',
						properties: {
							id: USER_ID_SCHEMA,
							name: { type: 'string', example: 'Juan' },
							surname: { type: 'string', example: 'Garcia' },
							email: { type: 'string', format: 'email', example: 'juan.garcia@correo.com' },
							username: { type: 'string', example: 'jgarcia01' },
							role: { type: 'string', example: 'USER' },
							isEmailVerified: { type: 'boolean', example: false },
							createdAt: { type: 'string', format: 'date-time' },
						},
					},
				},
			},
			LoginResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					message: { type: 'string', example: 'Sesion iniciada correctamente' },
					data: {
						type: 'object',
						properties: {
							id: USER_ID_SCHEMA,
							name: { type: 'string', example: 'Juan' },
							surname: { type: 'string', example: 'Garcia' },
							email: { type: 'string', format: 'email', example: 'juan.garcia@correo.com' },
							username: { type: 'string', example: 'jgarcia01' },
							role: { type: 'string', example: 'USER' },
							token: {
								type: 'string',
								example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
							},
						},
					},
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
		options.customSiteTitle || 'Sistema Bancario - API Documentation';
	const swaggerHandler = swaggerUi.setup(swaggerSpec, { customSiteTitle });

	app.get(`${route}.json`, (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});

	app.use(route, swaggerUi.serve);
	app.get(route, swaggerHandler);
	app.get(`${route}/`, swaggerHandler);
};
