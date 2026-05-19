import Product from '../models/product.model.js';
import mongoose from 'mongoose';
import ProductRequest from '../models/product-request.model.js';

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

export const createProductRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido',
      });
    }

    const product = await Product.findById(productId);
    if (!product || product.type !== 'PRODUCTO') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }
    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: 'El producto no está activo',
      });
    }

    const existingPending = await ProductRequest.findOne({
      product_id: productId,
      user_id: userId,
      status: 'PENDIENTE',
    });
    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: 'Ya tienes una solicitud pendiente para este producto',
      });
    }

    const request = await ProductRequest.create({
      product_id: productId,
      user_id: userId,
      notes: String(notes || '').trim(),
      status: 'PENDIENTE',
    });

    return res.status(201).json({
      success: true,
      message: 'Solicitud enviada correctamente',
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getMyProductRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const filter = { user_id: userId };
    if (status) filter.status = status;

    const requests = await ProductRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('product_id', 'name description type price is_active');

    return res.json({
      success: true,
      total: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getAllProductRequests = async (req, res) => {
  try {
    const { status, user_id, productId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (user_id) filter.user_id = user_id;
    if (productId && mongoose.Types.ObjectId.isValid(productId)) filter.product_id = productId;

    const requests = await ProductRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('product_id', 'name description type price is_active');

    return res.json({
      success: true,
      total: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const updateProductRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;

    const allowedStatuses = ['APROBADO', 'RECHAZADO'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Usa APROBADO o RECHAZADO',
      });
    }

    const request = await ProductRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
      });
    }

    if (request.status !== 'PENDIENTE') {
      return res.status(409).json({
        success: false,
        message: 'La solicitud ya fue gestionada y no puede cambiar de estado',
      });
    }

    request.status = status;
    request.admin_notes = String(adminNotes || '').trim();
    request.reviewed_by = adminId;
    request.reviewed_at = new Date();
    await request.save();

    await request.populate('product_id', 'name description type price is_active');

    return res.json({
      success: true,
      message: 'Estado de solicitud actualizado correctamente',
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
