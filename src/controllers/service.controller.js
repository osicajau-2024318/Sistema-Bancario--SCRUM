import Service from '../models/service.model.js';
import mongoose from 'mongoose';

export const createService = async (req, res) => {
  try {
    const { name, description, assigned_to } = req.body;
    const created_by = req.user.id;

    const service = new Service({
      name,
      description: description || '',
      created_by,
      assigned_to: assigned_to || null
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Servicio creado correctamente',
      service
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de servicio inválidos',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al crear servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getServices = async (req, res) => {
  try {
    const { is_active, assigned_to } = req.query;
    const filter = {};
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    if (assigned_to) filter.assigned_to = assigned_to;

    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.json({
      success: true,
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, assigned_to } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (is_active !== undefined) update.is_active = is_active;
    if (assigned_to !== undefined) update.assigned_to = assigned_to || null;

    const service = await Service.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Servicio actualizado correctamente',
      service
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de servicio inválidos',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al actualizar servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    res.json({
      success: true,
      message: 'Servicio eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
