import Favorite from '../models/favorite.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import mongoose from 'mongoose';
import { transferFromFavorite } from '../services/favorite.service.js';

// Crear favorito
export const createFavorite = async (req, res) => {
  try {
    const { alias, account_number } = req.body;
    const userId = req.user.id;

    // Validar que el alias y número de cuenta estén presentes
    if (!alias || !account_number) {
      return res.status(400).json({ 
        success: false,
        message: 'El alias y número de cuenta son requeridos' 
      });
    }

    const account = await Account.findOne({ account_number });
    if (!account) {
      return res.status(404).json({ 
        success: false,
        message: `No se encontró cuenta con número ${account_number}` 
      });
    }

    const exists = await Favorite.findOne({ 
      owner_user_id: userId,
      account_number 
    });

    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: `La cuenta ${account_number} ya está guardada en tus favoritos` 
      });
    }

    const favorite = new Favorite({
      alias,
      account_number,
      account_type: account.account_type,
      owner_user_id: userId
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: 'Favorito agregado exitosamente',
      favorite
    });

  } catch (error) {
    console.error('Error al crear favorito:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al agregar favorito. Por favor intente nuevamente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener mis favoritos
export const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ owner_user_id: userId });

    res.json({
      success: true,
      total: favorites.length,
      message: favorites.length === 0 ? 'No tienes favoritos guardados' : undefined,
      favorites
    });

  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener tus favoritos. Por favor intente nuevamente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar alias
export const updateFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { alias } = req.body;

    // Validar que el alias esté presente
    if (!alias || alias.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'El alias no puede estar vacío' 
      });
    }

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de favorito inválido' 
      });
    }

    const favorite = await Favorite.findOneAndUpdate(
      { _id: id, owner_user_id: userId },
      { alias },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({ 
        success: false,
        message: 'Favorito no encontrado. Verifique que el ID sea correcto' 
      });
    }

    res.json({
      success: true,
      message: 'Alias del favorito actualizado exitosamente',
      favorite
    });

  } catch (error) {
    console.error('Error al actualizar favorito:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar el favorito. Por favor intente nuevamente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar favorito
export const deleteFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de favorito inválido' 
      });
    }

    const favorite = await Favorite.findOneAndDelete({ 
      _id: id, 
      owner_user_id: userId 
    });

    if (!favorite) {
      return res.status(404).json({ 
        success: false,
        message: 'Favorito no encontrado. Verifique que el ID sea correcto' 
      });
    }

    res.json({
      success: true,
      message: 'Favorito eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar el favorito. Por favor intente nuevamente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Transferencia rápida desde favorito
export const quickTransferFromFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const fromUserId = req.user.id;

    const result = await transferFromFavorite(id, amount, fromUserId);
    
    res.json(result);

  } catch (error) {
    // Mapear errores a códigos HTTP apropiados
    if (error.message === 'Favorito no encontrado') {
      return res.status(404).json({ 
        success: false,
        message: error.message 
      });
    }
    if (error.message === 'No tienes permiso para usar este favorito') {
      return res.status(403).json({ 
        success: false,
        message: error.message 
      });
    }
    if (error.message === 'Cuenta origen no existe' || error.message === 'Cuenta destino no existe') {
      return res.status(404).json({ 
        success: false,
        message: error.message 
      });
    }
    if (error.message.includes('Monto inválido') || 
        error.message.includes('No puedes transferirte') || 
        error.message.includes('Cuenta no activa') ||
        error.message.includes('Límite por transferencia') ||
        error.message.includes('Saldo insuficiente')) {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
    
    console.error('Error en transferencia rápida:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en transferencia rápida. Por favor intente nuevamente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};