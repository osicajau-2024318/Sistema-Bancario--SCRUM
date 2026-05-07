import Product from '../models/product.model.js';
import mongoose from 'mongoose';

// Crear producto/servicio (solo admin)
export const createProduct = async (req, res) => {
  try {
    const { name, description, type, price } = req.body;
    const created_by = req.user.id;

    const product = new Product({
      name,
      description: description || undefined,
      type,
      price,
      created_by
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Producto creado correctamente',
      product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de producto inválidos',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener todos los productos/servicios
export const getProducts = async (req, res) => {
  try {
    const { type, is_active } = req.query;

    const filter = {};
    if (type && ['PRODUCTO', 'SERVICIO'].includes(type)) filter.type = type;
    if (is_active !== undefined) filter.is_active = is_active === 'true';

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener producto por ID (público)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar producto/servicio (solo admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, is_active, type } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (price !== undefined) update.price = price;
    if (is_active !== undefined) update.is_active = is_active;
    if (type !== undefined) update.type = type;

    const product = await Product.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto actualizado correctamente',
      product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de producto inválidos',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar producto/servicio (solo admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
