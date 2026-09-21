const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { mineBlock } = require('../src/modules/blockchain/mining.service');
const { MINING_DIFFICULTY } = require('../src/config/env');

dotenv.config();

const connectDB = require('../src/config/database');
const Usuario = require('../src/modules/usuarios/usuarios.model');
const Pago = require('../src/modules/pagos/pagos.model');
const bcrypt = require('bcrypt');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear collections
    await Usuario.deleteMany({});
    await Pago.deleteMany({});
    
    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const admin = new Usuario({
      nombre: 'Admin General',
      email: 'admin@zonekids.com',
      password: hashedPassword,
      rol: 'admin'
    });
    await admin.save();
    
    // Seed Pagos Blockchain
    console.log('Seeding Pagos Blockchain...');
    let chain = [];
    
    const pagosData = [
      { estudiante: 'Juan Perez', concepto: 'Matricula', valor: 500000, metodo: 'Efectivo', mes: 'Enero' },
      { estudiante: 'Maria Gomez', concepto: 'Pension', valor: 300000, metodo: 'Transferencia', mes: 'Febrero' }
    ];
    
    for (let i = 0; i < pagosData.length; i++) {
      let block = {
        index: i,
        date: new Date(),
        data: pagosData[i],
        previousHash: i === 0 ? '' : chain[i - 1].hash,
        nonce: 0,
        hash: ''
      };
      
      block = mineBlock(block, MINING_DIFFICULTY || '00');
      chain.push(block);
    }
    
    await Pago.insertMany(chain);
    
    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with seed data: ${error}`);
    process.exit(1);
  }
};

seedData();
