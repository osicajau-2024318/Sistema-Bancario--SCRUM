'use strict';

import User from '../src/models/user.model.js';
import crypto from 'crypto';

export const createDefaultAdmin = async () => {
    try {
        // Verificar si ya existe el admin
        const existingAdmin = await User.findOne({ user_username: 'ADMINB' });

        if (existingAdmin) {
            console.log(' Administrador ADMINB ya existe');
            return;
        }

        // Generar número de cuenta para el admin
        const user_number_account = crypto.randomInt(1000000000, 9999999999).toString();

        // Crear admin por defecto
        const admin = new User({
            user_name: "Administrador",
            user_username: "ADMINB",
            user_email: "admin@banco.com",
            user_password: "ADMINB",
            user_number_account,
            balance: 0,
            user_dpi: "0000000000000",
            user_address: "Oficina Central",
            user_phone_number: "00000000",
            user_name_work: "Banco Central",
            user_income_month: 10000,
            user_type: "ADMIN",
            estado: true
        });

        await admin.save();
        console.log(' Administrador ADMINB creado exitosamente');
        console.log('   Usuario: ADMINB');
        console.log('   Password: ADMINB');
        console.log('   Cuenta:', user_number_account);
    } catch (error) {
        console.error(' Error creando administrador:', error.message);
    }
};