import Product from '../models/product.model.js';

// Crear producto/servicio (solo admin)
export const createProduct = async (req, res) => {
  try {
    const { name, description, type, price } = req.body;
    const created_by = req.user.id;

    const product = new Product({
      name,
      description,
      type,
      price,
      created_by
    });

    await product.save();

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

// Obtener todos los productos/servicios
export const getProducts = async (req, res) => {
  try {
    const { type, is_active } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (is_active !== undefined) filter.is_active = is_active === 'true';

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// Obtener producto por ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

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
      error: error.message
    });
  }
};

// Actualizar producto/servicio (solo admin)
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, is_active } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, is_active },
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
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
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
      error: error.message
    });
  }
};
