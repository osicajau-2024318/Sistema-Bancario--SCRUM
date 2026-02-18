import mongoose from "mongoose";
import Transaccion from "../models/transacciones.model.js";
import Cuenta from "../models/cuenta.model.js";

export const createTransaccion = async (req, res) => {
  try {
    const { tipo, monto, descripcion, cuentaOrigen, cuentaDestino } = req.body;
    const usuarioId = req.user.id;

    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum <= 0)
      return res.status(400).json({ success: false, message: "Monto inválido" });

    // Primera validación rápida fuera de la sesión
    const cuenta = await Cuenta.findById(cuentaOrigen);
    if (!cuenta)
      return res.status(404).json({ success: false, message: "Cuenta origen no encontrada" });

    if (!cuenta.usuario.equals(usuarioId))
      return res.status(403).json({ success: false, message: "No puedes operar con esta cuenta" });

    if ((tipo === "RETIRO" || tipo === "TRANSFERENCIA") && cuenta.saldo < montoNum)
      return res.status(400).json({ success: false, message: "Saldo insuficiente" });

    // Reglas por transferencia (validaciones de negocio)
    if (tipo === "TRANSFERENCIA") {
      if (!cuentaDestino)
        return res.status(400).json({ success: false, message: "Cuenta destino requerida" });

      if (montoNum > 2000)
        return res.status(400).json({ success: false, message: "Monto máximo por transferencia: Q2000" });

      // Límite diario Q10,000
      const inicioDia = new Date(); inicioDia.setHours(0,0,0,0);
      const finDia = new Date(); finDia.setHours(23,59,59,999);

      const transferenciasHoy = await Transaccion.aggregate([
        {
          $match: {
            usuario: mongoose.Types.ObjectId(usuarioId),
            tipo: "TRANSFERENCIA",
            cuentaOrigen: mongoose.Types.ObjectId(cuentaOrigen),
            createdAt: { $gte: inicioDia, $lte: finDia },
            estado: true,
          },
        },
        { $group: { _id: null, total: { $sum: "$monto" } } },
      ]).exec();

      const totalHoy = transferenciasHoy.length > 0 ? transferenciasHoy[0].total : 0;
      if (totalHoy + montoNum > 10000)
        return res.status(400).json({ success: false, message: "Límite diario de transferencias excedido (Q10,000)" });
    }

    const session = await mongoose.startSession();
    try {
      let createdTransaccion = null;
      await session.withTransaction(async () => {
        const cuentaSession = await Cuenta.findById(cuentaOrigen).session(session);
        if (!cuentaSession)
          throw new Error("Cuenta origen no encontrada");

        // revalidar saldo dentro de la sesión
        if ((tipo === "RETIRO" || tipo === "TRANSFERENCIA") && cuentaSession.saldo < montoNum)
          throw new Error("Saldo insuficiente");

        let cuentaDestinoDoc = null;
        if (tipo === "TRANSFERENCIA") {
          cuentaDestinoDoc = await Cuenta.findById(cuentaDestino).session(session);
          if (!cuentaDestinoDoc)
            throw new Error("Cuenta destino no encontrada");

          cuentaSession.saldo -= montoNum;
          cuentaDestinoDoc.saldo += montoNum;
          await cuentaDestinoDoc.save({ session });
        }

        if (tipo === "DEPOSITO") cuentaSession.saldo += montoNum;
        if (tipo === "RETIRO") cuentaSession.saldo -= montoNum;

        await cuentaSession.save({ session });

        const transaccion = new Transaccion({
          tipo,
          monto: montoNum,
          descripcion,
          usuario: usuarioId,
          cuentaOrigen,
          cuentaDestino: tipo === "TRANSFERENCIA" ? (cuentaDestinoDoc?._id || null) : null,
        });

        createdTransaccion = await transaccion.save({ session });
      });

      res.status(201).json({ success: true, message: "Transacción realizada", transaccion: createdTransaccion });
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error(error);
    if (error.message === "Saldo insuficiente")
      return res.status(400).json({ success: false, message: "Saldo insuficiente" });
    if (error.message === "Cuenta destino no encontrada")
      return res.status(404).json({ success: false, message: "Cuenta destino no encontrada" });

    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

// Obtener todas las transacciones activas
export const getTransacciones = async (req, res) => {
  try {
    const transacciones = await Transaccion.find({ estado: true })
      .populate("usuario", "nombre email")
      .populate("cuentaOrigen", "numeroCuenta saldo")
      .populate("cuentaDestino", "numeroCuenta saldo")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, transacciones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener transacción por ID
export const getTransaccionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaccion = await Transaccion.findById(id)
      .populate("usuario", "nombre email")
      .populate("cuentaOrigen", "numeroCuenta saldo")
      .populate("cuentaDestino", "numeroCuenta saldo");

    if (!transaccion) return res.status(404).json({ success: false, message: "No encontrada" });

    res.status(200).json({ success: true, transaccion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Modificar o revertir depósito (monto, descripción, cuenta destino)
export const modificarORevertirDeposito = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoMonto, nuevaDescripcion, nuevaCuentaDestino, revertir } = req.body;

    const deposito = await Transaccion.findById(id);
    if (!deposito)
      return res.status(404).json({ success: false, message: "Depósito no encontrado" });

    if (deposito.tipo !== "DEPOSITO")
      return res.status(400).json({ success: false, message: "Solo se pueden modificar depósitos" });

    // Autorización: solo propietario o administrador
    if (!deposito.usuario.equals(req.user.id) && req.user.role !== "ADMIN")
      return res.status(403).json({ success: false, message: "No autorizado para modificar este depósito" });

    const ahora = new Date();
    const tiempoSegundos = (ahora - deposito.createdAt) / 1000;

    // Reversión
    if (revertir) {
      if (tiempoSegundos > 60)
        return res.status(400).json({ success: false, message: "Solo puede revertirse dentro de 1 minuto" });

      const cuentaOrigen = await Cuenta.findById(deposito.cuentaOrigen);
      if (!cuentaOrigen)
        return res.status(404).json({ success: false, message: "Cuenta original no encontrada" });

      cuentaOrigen.saldo -= deposito.monto;
      await cuentaOrigen.save();

      deposito.estado = false;
      await deposito.save();

      return res.status(200).json({ success: true, message: "Depósito revertido", deposito });
    }

    // Modificación
    const cuentaOrigen = await Cuenta.findById(deposito.cuentaOrigen);
    if (!cuentaOrigen)
      return res.status(404).json({ success: false, message: "Cuenta original no encontrada" });

    // Validar nuevo monto si viene
    let nuevoMontoNum = null;
    if (nuevoMonto !== undefined) {
      nuevoMontoNum = Number(nuevoMonto);
      if (!Number.isFinite(nuevoMontoNum) || nuevoMontoNum <= 0)
        return res.status(400).json({ success: false, message: "Nuevo monto inválido" });
    }

    // Ajuste saldo: restar monto anterior
    cuentaOrigen.saldo -= deposito.monto;

    // Cambio de cuenta destino
    let cuentaDestinoDoc = null;
    if (nuevaCuentaDestino) {
      cuentaDestinoDoc = await Cuenta.findById(nuevaCuentaDestino);
      if (!cuentaDestinoDoc)
        return res.status(404).json({ success: false, message: "Nueva cuenta destino no encontrada" });

      deposito.cuentaDestino = cuentaDestinoDoc._id;
    } else if (deposito.cuentaDestino) {
      cuentaDestinoDoc = await Cuenta.findById(deposito.cuentaDestino);
    }

    // Aplicar nuevo monto (si provisto)
    if (nuevoMontoNum !== null) cuentaOrigen.saldo += nuevoMontoNum;
    else cuentaOrigen.saldo += deposito.monto;
    await cuentaOrigen.save();

    // Actualizar depósito
    if (nuevoMontoNum !== null) deposito.monto = nuevoMontoNum;
    if (nuevaDescripcion) deposito.descripcion = nuevaDescripcion;
    await deposito.save();

    res.status(200).json({ success: true, message: "Depósito modificado", deposito });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};
