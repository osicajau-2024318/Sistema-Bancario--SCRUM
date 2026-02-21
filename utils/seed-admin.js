'use strict';

import User from '../src/models/user.model.js';
import crypto from 'crypto';

export const createDefaultAdmin = async () => {
    try {
        // Verificar si ya existe el admin
        const existingAdmin = await User.findOne({ username: 'ADMINB' });
        
        if (existingAdmin) {
            console.log(' Administrador ADMINB ya existe');
            return;
        }

        // Generar número de cuenta para el admin
        const numeroCuenta = crypto.randomInt(1000000000, 9999999999).toString();

        // Crear admin por defecto
       const admin = new User({
        name: "Administrador",
        username: "ADMINB",
        email: "admin@banco.com",
        password: "ADMINB", 
        numeroCuenta: numeroCuenta,   
        balance: 0,
        dpi: "0000000000000",
        address: "Oficina Central",
        cellphone: "00000000",
        workPlace: "Banco Central",
        monthlyIncome: 10000,
        rol: "ADMIN",                 
        estado: true                  
        });



        await admin.save();
        console.log(' Administrador ADMINB creado exitosamente');
        console.log('   Usuario: ADMINB');
        console.log('   Password: ADMINB');
        console.log('   Cuenta:', numeroCuenta);
    } catch (error) {
        console.error(' Error creando administrador:', error.message);
    }
};