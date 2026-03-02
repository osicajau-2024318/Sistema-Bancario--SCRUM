import Favorite from '../models/favorite.model.js';
import Account from '../models/account.model.js';

// Crear favorito
export const createFavorite = async (req, res) => {
  try {
    const { alias, account_number } = req.body;
    const userId = req.user.id;

    const account = await Account.findOne({ account_number });
    if (!account) {
      return res.status(404).json({ message: 'Cuenta no existe' });
    }

    const exists = await Favorite.findOne({ 
      owner_user_id: userId,
      account_number 
    });

    if (exists) {
      return res.status(400).json({ message: 'Cuenta ya está en favoritos' });
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
      message: 'Favorito agregado',
      favorite
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al crear favorito', error: error.message });
  }
};

// Obtener mis favoritos
export const getMyFavorites = async (req, res) => {
  const userId = req.user.id;

  const favorites = await Favorite.find({ owner_user_id: userId });

  res.json({
    success: true,
    total: favorites.length,
    favorites
  });
};

// Actualizar alias
export const updateFavorite = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const favorite = await Favorite.findOneAndUpdate(
    { _id: id, owner_user_id: userId },
    { alias: req.body.alias },
    { new: true }
  );

  if (!favorite) {
    return res.status(404).json({ message: 'Favorito no encontrado' });
  }

  res.json({
    success: true,
    message: 'Favorito actualizado',
    favorite
  });
};

// Eliminar favorito
export const deleteFavorite = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const favorite = await Favorite.findOneAndDelete({ 
    _id: id, 
    owner_user_id: userId 
  });

  if (!favorite) {
    return res.status(404).json({ message: 'Favorito no encontrado' });
  }

  res.json({
    success: true,
    message: 'Favorito eliminado'
  });
};