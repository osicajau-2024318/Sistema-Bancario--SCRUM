/**
 * Seed idempotente de datos de demo.
 *
 * Pobla cuentas, transacciones, productos, servicios, favoritos, solicitudes
 * de productos y pagos de servicios para:
 *   - Admin operador:  usr_b6SiNwzHv9xs (admin@bank.com)
 *   - Cliente principal: usr_XuySN4MrrgSE (josueboror2018@gmail.com)
 *   - 3 cuentas auxiliares de terceros que sirven como destino de favoritos
 *     y transferencias salientes.
 *
 * Ejecutar:
 *   cd Sistema-Bancario--SCRUM && node scripts/seed.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import Account from '../src/models/account.model.js';
import Transaction from '../src/models/transaction.model.js';
import Product from '../src/models/product.model.js';
import ProductRequest from '../src/models/product-request.model.js';
import ServicePayment from '../src/models/service-payment.model.js';
import Favorite from '../src/models/favorite.model.js';

const ADMIN_ID = 'usr_b6SiNwzHv9xs';
const CLIENT_ID = 'usr_XuySN4MrrgSE';
const DEST1_ID = 'usr_seed_dst_1';
const DEST2_ID = 'usr_seed_dst_2';
const DEST3_ID = 'usr_seed_dst_3';

const SEED_TAG = 'SEED_DEMO_v1';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY_MS);

function logSection(title) {
  console.log(`\n— ${title} —`);
}

async function clearSeedArtifacts() {
  logSection('Limpiando datos previos del seed');
  const userIds = [CLIENT_ID, DEST1_ID, DEST2_ID, DEST3_ID];

  const accounts = await Account.find({ user_id: { $in: userIds } });
  const accountIds = accounts.map((a) => a._id);
  const accountNumbers = accounts.map((a) => a.account_number);

  const txDel = await Transaction.deleteMany({
    $or: [
      { user_id: { $in: userIds } },
      { account_id: { $in: accountIds } },
      { from_account: { $in: accountNumbers } },
      { to_account: { $in: accountNumbers } },
    ],
  });
  const payDel = await ServicePayment.deleteMany({ user_id: { $in: userIds } });
  const reqDel = await ProductRequest.deleteMany({ user_id: { $in: userIds } });
  const favDel = await Favorite.deleteMany({ owner_user_id: { $in: userIds } });
  const accDel = await Account.deleteMany({ user_id: { $in: userIds } });
  const prodDel = await Product.deleteMany({
    created_by: ADMIN_ID,
    description: { $regex: SEED_TAG },
  });

  console.log(`  transacciones eliminadas:   ${txDel.deletedCount}`);
  console.log(`  pagos servicio eliminados:  ${payDel.deletedCount}`);
  console.log(`  solicitudes eliminadas:     ${reqDel.deletedCount}`);
  console.log(`  favoritos eliminados:       ${favDel.deletedCount}`);
  console.log(`  cuentas eliminadas:         ${accDel.deletedCount}`);
  console.log(`  productos seed eliminados:  ${prodDel.deletedCount}`);
}

async function createAccounts() {
  logSection('Creando cuentas');
  const make = (userId, type, currency, suffix) =>
    new Account({
      account_number: `99${suffix}${Math.floor(10000000 + Math.random() * 89999999)}`.slice(0, 10),
      account_type: type,
      currency,
      user_id: userId,
      estado: 'ACTIVA',
      balance: 0,
    });

  const c1 = make(CLIENT_ID, 'AHORRO', 'GTQ', '01');
  const c2 = make(CLIENT_ID, 'CORRIENTE', 'GTQ', '02');
  const c3 = make(CLIENT_ID, 'AHORRO', 'USD', '03');
  const d1 = make(DEST1_ID, 'AHORRO', 'GTQ', '04');
  const d2 = make(DEST2_ID, 'CORRIENTE', 'GTQ', '05');
  const d3 = make(DEST3_ID, 'AHORRO', 'GTQ', '06');

  await Promise.all([c1.save(), c2.save(), c3.save(), d1.save(), d2.save(), d3.save()]);

  console.log(`  C1 (cliente AHORRO GTQ):    ${c1.account_number}`);
  console.log(`  C2 (cliente CORRIENTE GTQ): ${c2.account_number}`);
  console.log(`  C3 (cliente AHORRO USD):    ${c3.account_number}`);
  console.log(`  D1 (destino Mamá):          ${d1.account_number}`);
  console.log(`  D2 (destino Renta):         ${d2.account_number}`);
  console.log(`  D3 (destino Tienda):        ${d3.account_number}`);

  return { c1, c2, c3, d1, d2, d3 };
}

async function createCatalog() {
  logSection('Creando productos y servicios');
  const productsDefs = [
    {
      name: 'Tarjeta de Crédito Gold',
      description: `${SEED_TAG} Tarjeta premium con beneficios extendidos en comercios afiliados.`,
      type: 'PRODUCTO',
      price: 250,
    },
    {
      name: 'Préstamo Personal',
      description: `${SEED_TAG} Crédito desde Q5,000 con tasa preferencial y plazos flexibles.`,
      type: 'PRODUCTO',
      price: 5000,
    },
    {
      name: 'Seguro de Vida',
      description: `${SEED_TAG} Cobertura básica con cuota mensual accesible.`,
      type: 'PRODUCTO',
      price: 120,
    },
    {
      name: 'Plan de Inversión',
      description: `${SEED_TAG} Portafolio gestionado con rendimientos proyectados.`,
      type: 'PRODUCTO',
      price: 1500,
    },
    {
      name: 'Pago de Energía Eléctrica',
      description: `${SEED_TAG} Pago de servicio de luz domiciliar.`,
      type: 'SERVICIO',
      price: 150,
    },
    {
      name: 'Pago de Agua Municipal',
      description: `${SEED_TAG} Pago de servicio de agua potable.`,
      type: 'SERVICIO',
      price: 80,
    },
    {
      name: 'Pago de Internet',
      description: `${SEED_TAG} Plan residencial de internet 200 Mbps.`,
      type: 'SERVICIO',
      price: 250,
    },
  ];

  const created = await Product.insertMany(
    productsDefs.map((p) => ({ ...p, is_active: true, created_by: ADMIN_ID }))
  );

  const byName = (n) => created.find((p) => p.name === n);
  console.log(`  productos: ${created.filter((p) => p.type === 'PRODUCTO').length}`);
  console.log(`  servicios: ${created.filter((p) => p.type === 'SERVICIO').length}`);

  return {
    tarjeta: byName('Tarjeta de Crédito Gold'),
    prestamo: byName('Préstamo Personal'),
    seguro: byName('Seguro de Vida'),
    inversion: byName('Plan de Inversión'),
    luz: byName('Pago de Energía Eléctrica'),
    agua: byName('Pago de Agua Municipal'),
    internet: byName('Pago de Internet'),
  };
}

async function applyMovements(accounts) {
  logSection('Generando movimientos (depósitos + transferencias)');
  const { c1, c2, c3, d1, d2 } = accounts;
  const txs = [];

  const deposito = async (account, amount, name, when) => {
    account.balance += amount;
    await account.save();
    txs.push({
      transaction_name: name,
      transaction_amount: amount,
      transaction_type: 'DEPOSITO',
      transaction_method_payment: 'DEPOSITO',
      from_account: null,
      to_account: account.account_number,
      account_id: account._id,
      user_id: account.user_id,
      revertible: false,
      createdAt: when,
      updatedAt: when,
    });
  };

  const transfer = async (from, to, amount, label, when) => {
    if (from.balance < amount) {
      throw new Error(`Saldo insuficiente al simular ${label}`);
    }
    from.balance -= amount;
    to.balance += amount;
    from.daily_transferred_amount = (from.daily_transferred_amount || 0) + amount;
    from.last_transfer_date = when;
    await from.save();
    await to.save();

    txs.push({
      transaction_name: `Transferencia (débito): ${label}`,
      transaction_amount: amount,
      transaction_type: 'DEBITO',
      transaction_method_payment: 'TRANSFERENCIA',
      from_account: from.account_number,
      to_account: to.account_number,
      account_id: from._id,
      user_id: from.user_id,
      revertible: false,
      createdAt: when,
      updatedAt: when,
    });
    txs.push({
      transaction_name: `Transferencia (crédito): ${label}`,
      transaction_amount: amount,
      transaction_type: 'CREDITO',
      transaction_method_payment: 'TRANSFERENCIA',
      from_account: from.account_number,
      to_account: to.account_number,
      account_id: to._id,
      user_id: to.user_id,
      revertible: false,
      createdAt: when,
      updatedAt: when,
    });
  };

  await deposito(c1, 1000, 'Depósito inicial AHORRO', daysAgo(7));
  await deposito(c2, 500, 'Depósito inicial CORRIENTE', daysAgo(6));
  await deposito(c3, 100, 'Depósito inicial USD', daysAgo(6));

  await transfer(c1, c2, 200, 'Reasignación interna AHORRO→CORRIENTE', daysAgo(5));
  await transfer(c1, d1, 300, 'Envío a Mamá', daysAgo(3));

  await deposito(c1, 5000, 'Acreditación de planilla', daysAgo(1));
  await deposito(c3, 200, 'Depósito remesa USD', daysAgo(1));

  // Aún quedan los pagos de servicio (los insertamos más abajo para enlazar payment_id)
  return { txs, c1, c2, c3, d1, d2 };
}

async function insertTransactions(txDefs) {
  const inserted = await Transaction.insertMany(txDefs);
  console.log(`  transacciones creadas: ${inserted.length}`);
  return inserted;
}

async function createProductRequests(catalog) {
  logSection('Generando solicitudes de productos');
  const pendiente = await ProductRequest.create({
    product_id: catalog.tarjeta._id,
    user_id: CLIENT_ID,
    notes: 'Quisiera obtener la tarjeta para gastos recurrentes.',
    status: 'PENDIENTE',
  });
  const aprobada = await ProductRequest.create({
    product_id: catalog.prestamo._id,
    user_id: CLIENT_ID,
    notes: 'Necesito el préstamo para una compra programada.',
    status: 'APROBADO',
    admin_notes: 'Aprobado tras verificar ingresos mensuales y estado de cuentas.',
    reviewed_by: ADMIN_ID,
    reviewed_at: daysAgo(1),
  });

  console.log(`  PENDIENTE: ${catalog.tarjeta.name} (${pendiente._id})`);
  console.log(`  APROBADO:  ${catalog.prestamo.name} (${aprobada._id})`);
}

async function createServicePayments(catalog, accounts) {
  logSection('Generando pagos de servicio (afectan saldo real)');
  const { c2 } = accounts;
  const now = new Date();

  // Pago de luz Q150
  c2.balance -= 150;
  await c2.save();
  const txLuz = await Transaction.create({
    transaction_name: `Pago de servicio: ${catalog.luz.name}`,
    transaction_amount: 150,
    transaction_type: 'DEBITO',
    transaction_method_payment: 'COMPRA',
    from_account: c2.account_number,
    to_account: null,
    account_id: c2._id,
    user_id: CLIENT_ID,
    currency_from: 'GTQ',
    currency_to: 'GTQ',
    revertible: false,
    createdAt: now,
    updatedAt: now,
  });
  await ServicePayment.create({
    service_id: catalog.luz._id,
    account_id: c2._id,
    transaction_id: txLuz._id,
    user_id: CLIENT_ID,
    amount_requested: 150,
    amount_debited: 150,
    currency_from: 'GTQ',
    currency_to: 'GTQ',
    reference: 'NIS-A-09231',
    description: 'Pago mensual de luz',
    status: 'COMPLETADO',
  });

  // Pago de internet Q250
  c2.balance -= 250;
  await c2.save();
  const txInternet = await Transaction.create({
    transaction_name: `Pago de servicio: ${catalog.internet.name}`,
    transaction_amount: 250,
    transaction_type: 'DEBITO',
    transaction_method_payment: 'COMPRA',
    from_account: c2.account_number,
    to_account: null,
    account_id: c2._id,
    user_id: CLIENT_ID,
    currency_from: 'GTQ',
    currency_to: 'GTQ',
    revertible: false,
    createdAt: now,
    updatedAt: now,
  });
  await ServicePayment.create({
    service_id: catalog.internet._id,
    account_id: c2._id,
    transaction_id: txInternet._id,
    user_id: CLIENT_ID,
    amount_requested: 250,
    amount_debited: 250,
    currency_from: 'GTQ',
    currency_to: 'GTQ',
    reference: 'CONTRATO-INT-7821',
    description: 'Plan residencial 200 Mbps',
    status: 'COMPLETADO',
  });

  console.log('  Pago de luz Q150 desde CORRIENTE');
  console.log('  Pago de internet Q250 desde CORRIENTE');
}

async function createFavorites(accounts) {
  logSection('Generando cuentas favoritas');
  const { d1, d2, d3 } = accounts;
  await Favorite.create({
    alias: 'Mamá',
    account_number: d1.account_number,
    account_type: d1.account_type,
    owner_user_id: CLIENT_ID,
  });
  await Favorite.create({
    alias: 'Renta',
    account_number: d2.account_number,
    account_type: d2.account_type,
    owner_user_id: CLIENT_ID,
  });
  await Favorite.create({
    alias: 'Tienda',
    account_number: d3.account_number,
    account_type: d3.account_type,
    owner_user_id: CLIENT_ID,
  });
  console.log('  3 favoritos creados (Mamá, Renta, Tienda)');
}

async function printSummary(accounts) {
  logSection('Resumen final');
  const balances = await Account.find({
    user_id: { $in: [CLIENT_ID, DEST1_ID, DEST2_ID, DEST3_ID] },
  })
    .sort({ user_id: 1, account_type: 1 })
    .lean();
  balances.forEach((acc) => {
    console.log(
      `  ${acc.user_id}  ${acc.account_number}  ${acc.account_type}/${acc.currency}  saldo=${acc.balance.toFixed(2)}`
    );
  });

  const totals = {
    Account: await Account.countDocuments({}),
    Transaction: await Transaction.countDocuments({}),
    Product: await Product.countDocuments({}),
    ProductRequest: await ProductRequest.countDocuments({}),
    ServicePayment: await ServicePayment.countDocuments({}),
    Favorite: await Favorite.countDocuments({}),
  };
  console.log('  Totales globales:', totals);
  void accounts;
}

async function main() {
  if (!process.env.URI_MONGO) {
    console.error('Falta URI_MONGO en .env');
    process.exit(1);
  }
  console.log('Conectando a MongoDB…');
  await mongoose.connect(process.env.URI_MONGO);
  try {
    await clearSeedArtifacts();
    const accounts = await createAccounts();
    const catalog = await createCatalog();
    const { txs } = await applyMovements(accounts);
    await insertTransactions(txs);
    await createProductRequests(catalog);
    await createServicePayments(catalog, accounts);
    await createFavorites(accounts);
    await printSummary(accounts);
    console.log('\nSeed completado correctamente.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(async (err) => {
  console.error('Seed falló:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
