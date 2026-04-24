'use strict';

import swaggerUi from 'swagger-ui-express';

const BASE_PATH = '/SistemaBancarioAdmin/v1';

const TAGS = [
	{ name: 'Transaction', description: 'Operaciones y consultas de transacciones bancarias' },
	{ name: 'Deposit', description: 'Depósitos y administración de depósitos pendientes' },
	{ name: 'Activity', description: 'Historial de actividad y registros de cuenta' },
];

const AUTH_SECURITY = [{ bearerAuth: [] }];

const COMMON_RESPONSES = {
	BadRequest: {
		description: 'Solicitud inválida',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/ErrorResponse' },
				example: { success: false, message: 'Datos de entrada invalidos', error: 'VALIDATION_ERROR' },
			},
		},
	},
	Unauthorized: {
		description: 'Token faltante, expirado o inválido',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/ErrorResponse' },
				example: { success: false, message: 'Usuario no autenticado', error: 'UNAUTHORIZED' },
			},
		},
	},
	Forbidden: {
		description: 'El rol no tiene permiso para esta operación',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/ErrorResponse' },
				example: { success: false, message: 'Forbidden', error: 'FORBIDDEN' },
			},
		},
	},
	NotFound: {
		description: 'Recurso no encontrado',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/ErrorResponse' },
				example: { success: false, message: 'Recurso no encontrado', error: 'NOT_FOUND' },
			},
		},
	},
	InternalServerError: {
		description: 'Error interno del servidor',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/ErrorResponse' },
				example: { success: false, message: 'Error interno del servidor', error: 'INTERNAL_SERVER_ERROR' },
			},
		},
	},
};

const TRANSACTION_PATHS = {
	[`${BASE_PATH}/transactions/deposit`]: {
		post: {
			tags: ['Deposit'],
			operationId: 'createTransactionDeposit',
			summary: 'Crear depósito en una cuenta',
			description: 'Registra un depósito en una cuenta existente.',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/DepositRequest' },
						example: { accountNumber: '1234567890', amount: 1200, currency: 'GTQ', description: 'Depósito en ventanilla' },
					},
				},
			},
			responses: {
				201: { $ref: '#/components/responses/DepositCreated' },
				400: { $ref: '#/components/responses/BadRequest' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
	[`${BASE_PATH}/transactions/my-transactions`]: {
		get: {
			tags: ['Transaction'],
			operationId: 'getMyTransactions',
			summary: 'Obtener transacciones propias',
			description: 'Lista las transacciones del usuario autenticado.',
			security: AUTH_SECURITY,
			parameters: [
				{ $ref: '#/components/parameters/PageParam' },
				{ $ref: '#/components/parameters/LimitParam' },
				{ $ref: '#/components/parameters/TypeQueryParam' },
				{ $ref: '#/components/parameters/MethodQueryParam' },
				{ $ref: '#/components/parameters/FromDateParam' },
				{ $ref: '#/components/parameters/ToDateParam' },
				{ $ref: '#/components/parameters/SearchParam' },
			],
			responses: {
				200: { $ref: '#/components/responses/SuccessTransactionList' },
				401: { $ref: '#/components/responses/Unauthorized' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
	[`${BASE_PATH}/transactions`]: {
		get: {
			tags: ['Transaction'],
			operationId: 'getTransactionsAlias',
			summary: 'Alias para transacciones propias',
			description: 'Alias de /transactions/my-transactions.',
			security: AUTH_SECURITY,
			parameters: [
				{ $ref: '#/components/parameters/PageParam' },
				{ $ref: '#/components/parameters/LimitParam' },
				{ $ref: '#/components/parameters/TypeQueryParam' },
				{ $ref: '#/components/parameters/MethodQueryParam' },
				{ $ref: '#/components/parameters/FromDateParam' },
				{ $ref: '#/components/parameters/ToDateParam' },
				{ $ref: '#/components/parameters/SearchParam' },
			],
			responses: {
				200: { $ref: '#/components/responses/SuccessTransactionList' },
				401: { $ref: '#/components/responses/Unauthorized' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
	[`${BASE_PATH}/transactions/all`]: {
		get: {
			tags: ['Transaction'],
			operationId: 'getAllTransactions',
			summary: 'Obtener todas las transacciones',
			description: 'Lista todas las transacciones del sistema. Solo admin.',
			security: AUTH_SECURITY,
			responses: {
				200: { $ref: '#/components/responses/SuccessTransactionList' },
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
	[`${BASE_PATH}/transactions/{id}`]: {
		get: {
			tags: ['Transaction'],
			operationId: 'getTransactionById',
			summary: 'Obtener transacción por ID',
			description: 'Retorna el detalle de una transacción propia.',
			security: AUTH_SECURITY,
			parameters: [{ $ref: '#/components/parameters/TransactionIdPathParam' }],
			responses: {
				200: { $ref: '#/components/responses/TransactionDetail' },
				400: { $ref: '#/components/responses/BadRequest' },
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
};

const ACTIVITY_PATHS = {
	[`${BASE_PATH}/transactions/history/me`]: {
		get: {
			tags: ['Activity'],
			operationId: 'getOwnActivityHistory',
			summary: 'Historial de actividad propia',
			description: 'Historial de depósitos y transacciones del usuario autenticado.',
			security: AUTH_SECURITY,
			responses: {
				200: { $ref: '#/components/responses/ActivityHistory' },
				401: { $ref: '#/components/responses/Unauthorized' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
	[`${BASE_PATH}/transactions/history/{accountId}`]: {
		get: {
			tags: ['Activity'],
			operationId: 'getAccountActivityHistory',
			summary: 'Historial de actividad por cuenta',
			description: 'Historial de actividad de una cuenta específica. Solo admin.',
			security: AUTH_SECURITY,
			parameters: [{ $ref: '#/components/parameters/AccountIdPathParam' }],
			responses: {
				200: { $ref: '#/components/responses/ActivityHistoryByAccount' },
				400: { $ref: '#/components/responses/BadRequest' },
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
};

const DEPOSIT_PATHS = {
	[`${BASE_PATH}/deposits`]: {
		post: {
			tags: ['Deposit'],
			operationId: 'createDeposit',
			summary: 'Registrar un depósito',
			description: 'Crea un depósito hacia una cuenta bancaria.',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/DepositRequest' },
					},
				},
			},
			responses: {
				201: { $ref: '#/components/responses/DepositCreated' },
				400: { $ref: '#/components/responses/BadRequest' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
	[`${BASE_PATH}/deposits/pending`]: {
		get: {
			tags: ['Deposit'],
			operationId: 'getPendingDeposits',
			summary: 'Obtener depósitos pendientes',
			description: 'Lista depósitos revertibles pendientes para admin.',
			security: AUTH_SECURITY,
			responses: {
				200: { $ref: '#/components/responses/PendingDeposits' },
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
	[`${BASE_PATH}/deposits/revert`]: {
		post: {
			tags: ['Deposit'],
			operationId: 'revertDeposit',
			summary: 'Revertir un depósito',
			description: 'Revierte un depósito pendiente.',
			security: AUTH_SECURITY,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/RevertDepositRequest' },
					},
				},
			},
			responses: {
				200: { $ref: '#/components/responses/SuccessMessageResponse' },
				400: { $ref: '#/components/responses/BadRequest' },
				401: { $ref: '#/components/responses/Unauthorized' },
				403: { $ref: '#/components/responses/Forbidden' },
				404: { $ref: '#/components/responses/NotFound' },
				500: { $ref: '#/components/responses/InternalServerError' },
			},
		},
	},
	[`${BASE_PATH}/deposits/{id}`]: {
		put: {
			tags: ['Deposit'],
			operationId: 'updateDeposit',
			summary: 'Actualizar monto de depósito',
			description: 'Modifica el monto de un depósito existente.',
			security: AUTH_SECURITY,
			parameters: [{ $ref: '#/components/parameters/DepositIdPathParam' }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UpdateDepositRequest' },
					},
				},
			},
			responses: {
				200: { $ref: '#/components/responses/SuccessMessageResponse' },
				400: { $ref: '#/components/responses/BadRequest' },
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
		title: 'Sistema Bancario - API de Transacciones y Depósitos',
		version: '1.0.0',
		description: 'Documentación de endpoints para transacciones, depósitos y actividad de cuenta.',
	},
	servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
	tags: TAGS,
	paths: { ...TRANSACTION_PATHS, ...ACTIVITY_PATHS, ...DEPOSIT_PATHS },
	components: {
		securitySchemes: {
			bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token JWT enviado en Authorization: Bearer <token>' },
		},
		parameters: {
			PageParam: { in: 'query', name: 'page', required: false, description: 'Número de página', schema: { type: 'integer', minimum: 1, default: 1 } },
			LimitParam: { in: 'query', name: 'limit', required: false, description: 'Tamaño de página', schema: { type: 'integer', minimum: 1, default: 10 } },
			TypeQueryParam: { in: 'query', name: 'type', required: false, description: 'Tipo de transacción', schema: { type: 'string', example: 'DEPOSITO' } },
			MethodQueryParam: { in: 'query', name: 'method', required: false, description: 'Método de pago', schema: { type: 'string', example: 'DEPOSITO' } },
			FromDateParam: { in: 'query', name: 'from_date', required: false, description: 'Fecha inicial', schema: { type: 'string', format: 'date', example: '2026-04-01' } },
			ToDateParam: { in: 'query', name: 'to_date', required: false, description: 'Fecha final', schema: { type: 'string', format: 'date', example: '2026-04-23' } },
			SearchParam: { in: 'query', name: 'search', required: false, description: 'Término de búsqueda', schema: { type: 'string', example: 'Pago servicio' } },
			TransactionIdPathParam: { in: 'path', name: 'id', required: true, description: 'ID de transacción', schema: { type: 'string', example: '6421b54f0b3c2f7a98d2e5a1' } },
			AccountIdPathParam: { in: 'path', name: 'accountId', required: true, description: 'ID de cuenta', schema: { type: 'string', example: '6421b54f0b3c2f7a98d2e5a1' } },
			DepositIdPathParam: { in: 'path', name: 'id', required: true, description: 'ID de depósito', schema: { type: 'string', example: '6421b54f0b3c2f7a98d2e5a1' } },
		},
		responses: {
			DepositCreated: { description: 'Depósito creado correctamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/DepositResponse' } } } },
			SuccessTransactionList: { description: 'Lista de transacciones', content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionsListResponse' } } } },
			TransactionDetail: { description: 'Detalle de transacción', content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionDetailResponse' } } } },
			ActivityHistory: { description: 'Historial de actividad', content: { 'application/json': { schema: { $ref: '#/components/schemas/ActivityHistoryResponse' } } } },
			ActivityHistoryByAccount: { description: 'Historial de actividad por cuenta', content: { 'application/json': { schema: { $ref: '#/components/schemas/ActivityHistoryByAccountResponse' } } } },
			PendingDeposits: { description: 'Depósitos pendientes', content: { 'application/json': { schema: { $ref: '#/components/schemas/PendingDepositsResponse' } } } },
			SuccessMessageResponse: { description: 'Operación exitosa', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessageResponse' } } } },
			BadRequest: COMMON_RESPONSES.BadRequest,
			Unauthorized: COMMON_RESPONSES.Unauthorized,
			Forbidden: COMMON_RESPONSES.Forbidden,
			NotFound: COMMON_RESPONSES.NotFound,
			InternalServerError: COMMON_RESPONSES.InternalServerError,
		},
		schemas: {
			ErrorResponse: { type: 'object', properties: { success: { type: 'boolean', example: false }, message: { type: 'string', example: 'Error de negocio' }, error: { type: 'string', example: 'BUSINESS_ERROR' } }, required: ['success', 'message'] },
			DepositRequest: { type: 'object', properties: { accountNumber: { type: 'string', example: '1234567890' }, amount: { type: 'number', minimum: 1, example: 1200 }, currency: { type: 'string', example: 'GTQ' }, description: { type: 'string', example: 'Depósito en ventanilla' } }, required: ['accountNumber', 'amount'] },
			DepositResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Depósito realizado exitosamente' }, data: { type: 'object', properties: { transaction_id: { type: 'string', example: '6421b54f0b3c2f7a98d2e5a1' }, account_number: { type: 'string', example: '1234567890' }, amount_deposited: { type: 'number', example: 1200 }, amount_credited: { type: 'number', example: 1200 }, currency_from: { type: ['string','null'], example: 'GTQ' }, currency_to: { type: ['string','null'], example: 'GTQ' }, exchange_rate: { type: ['number','null'], example: null }, description: { type: 'string', example: 'Depósito en ventanilla' }, new_balance: { type: 'number', example: 5200 }, conversion_note: { type: 'string', example: 'Sin conversión' }, timestamp: { type: 'string', format: 'date-time', example: '2026-04-23T14:20:00Z' } } } } },
			SuccessMessageResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Operación completada correctamente' } } },
			AccountSummary: { type: 'object', properties: { account_number: { type: 'string', example: '1234567890' }, account_type: { type: 'string', example: 'AHORRO' }, currency: { type: 'string', example: 'GTQ' } } },
			TransactionItem: { type: 'object', properties: { id: { type: 'string', example: '6421b54f0b3c2f7a98d2e5a1' }, transaction_name: { type: 'string', example: 'Depósito en ventanilla' }, transaction_amount: { type: 'number', example: 1200 }, transaction_type: { type: 'string', example: 'DEPOSITO' }, transaction_method_payment: { type: 'string', example: 'DEPOSITO' }, account_id: { $ref: '#/components/schemas/AccountSummary' }, from_account: { type: ['string','null'], example: null }, to_account: { type: ['string','null'], example: null }, currency_from: { type: ['string','null'], example: null }, currency_to: { type: ['string','null'], example: null }, exchange_rate: { type: ['number','null'], example: null }, revertible: { type: 'boolean', example: true }, reverted: { type: 'boolean', example: false }, createdAt: { type: 'string', format: 'date-time', example: '2026-04-23T14:20:00Z' }, updatedAt: { type: 'string', format: 'date-time', example: '2026-04-23T14:20:00Z' } } },
			TransactionsListResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, transactions: { type: 'array', items: { $ref: '#/components/schemas/TransactionItem' } }, summary: { type: 'object', properties: { total_transactions: { type: 'integer', example: 1 }, total_amount: { type: 'number', example: 1200 }, by_type: { type: 'object', additionalProperties: { type: 'object', properties: { count: { type: 'integer', example: 1 }, total: { type: 'number', example: 1200 } } } } } }, pagination: { type: 'object', properties: { total: { type: 'integer', example: 1 }, page: { type: 'integer', example: 1 }, pages: { type: 'integer', example: 1 }, limit: { type: 'integer', example: 10 } } } } },
			TransactionDetailResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, transaction: { $ref: '#/components/schemas/TransactionItem' } } },
			ActivityHistoryResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, total_records: { type: 'integer', example: 1 }, history: { type: 'array', items: { $ref: '#/components/schemas/TransactionItem' } } } },
			ActivityHistoryByAccountResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, accountId: { type: 'string', example: '6421b54f0b3c2f7a98d2e5a1' }, account_number: { type: 'string', example: '1234567890' }, total_records: { type: 'integer', example: 1 }, history: { type: 'array', items: { $ref: '#/components/schemas/TransactionItem' } } } },
			PendingDepositsResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, count: { type: 'integer', example: 1 }, deposits: { type: 'array', items: { type: 'object', properties: { id: { type: 'string', example: '6421b54f0b3c2f7a98d2e5a1' }, transaction_name: { type: 'string', example: 'Depósito en ventanilla' }, transaction_amount: { type: 'number', example: 1200 }, account_id: { $ref: '#/components/schemas/AccountSummary' }, createdAt: { type: 'string', format: 'date-time', example: '2026-04-23T14:20:00Z' }, secondsRemaining: { type: 'integer', example: 45 }, canRevert: { type: 'boolean', example: true } } } } } },
			RevertDepositRequest: { type: 'object', properties: { transactionId: { type: 'string', example: '6421b54f0b3c2f7a98d2e5a1' } }, required: ['transactionId'] },
			UpdateDepositRequest: { type: 'object', properties: { amount: { type: 'number', minimum: 1, example: 1800 } }, required: ['amount'] },
		},
	},
};

export const setupSwaggerDocs = (app, options = {}) => {
	const route = options.route || '/docs';
	const customSiteTitle = options.customSiteTitle || 'Sistema Bancario - API Documentation';
	const swaggerHandler = swaggerUi.setup(swaggerSpec, { customSiteTitle });

	app.get(`${route}.json`, (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});

	app.use(route, swaggerUi.serve);
	app.get(route, swaggerHandler);
	app.get(`${route}/`, swaggerHandler);
};
