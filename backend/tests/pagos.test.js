const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Pago = require('../src/modules/pagos/pagos.model');

describe('Pagos API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zone-kids-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Pago.deleteMany({});
  });

  it('should create a new pago and mine its block', async () => {
    const pagoData = {
      estudiante: 'Test Student',
      concepto: 'Mensualidad',
      valor: 150000,
      metodo: 'Tarjeta',
      mes: 'Marzo'
    };

    const res = await request(app)
      .post('/api/pagos')
      .send(pagoData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.index).toEqual(0);
    expect(res.body.data.data.estudiante).toEqual('Test Student');
    expect(res.body.data.hash).toBeDefined();
    expect(res.body.data.hash.startsWith(process.env.MINING_DIFFICULTY || '00')).toBeTruthy();
  });
});
