require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// 1. Servir automáticamente la carpeta frontend (HTML, CSS y JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// Base de datos en memoria de respaldo (por si Supabase no está conectado en local)
let estudiantes = [
  {
    id: 1,
    nombre: 'Mateo Gómez',
    edad: 4,
    grado: 'Jardín',
    id_familia: 'FAM-1001',
    nombreAcudiente: 'Laura Gómez',
    parentesco: 'Madre',
    contacto: '3001234567',
    consentimientoImagen: false,
    tipo_sangre: 'O+',
    eps: 'Sura',
    alergias: 'Maní y Penicilina'
  }
];

let pagos = [
  { id: 1, id_familia: 'FAM-1001', concepto: 'Mensualidad Octubre', valor: 450000, estado: 'Pendiente' },
  { id: 2, id_familia: 'FAM-1001', concepto: 'Extra: Uniforme', valor: 85000, estado: 'Pagado' }
];

let agendas = [];

// 2. Endpoints del Backend (Rúbrica: Conexión Frontend-Backend)
// HU01: Listar y registrar estudiantes vinculados a acudientes
app.get('/api/estudiantes', (req, res) => {
  res.json(estudiantes);
});

app.post('/api/estudiantes', (req, res) => {
  const nuevo = {
    id: estudiantes.length + 1,
    id_familia: 'FAM-' + Math.floor(1000 + Math.random() * 9000),
    ...req.body
  };
  estudiantes.push(nuevo);
  res.status(201).json(nuevo);
});

// HU03: Actualizar consentimiento legal de uso de imagen
app.patch('/api/estudiantes/:id/consentimiento', (req, res) => {
  const id = parseInt(req.params.id);
  const est = estudiantes.find(e => e.id === id);
  if (!est) return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
  est.consentimientoImagen = Boolean(req.body.autorizado);
  res.json(est);
});

// HU02: Consultar Ficha Médica y alertas de emergencia
app.get('/api/estudiantes/:id/ficha-medica', (req, res) => {
  const id = parseInt(req.params.id);
  const est = estudiantes.find(e => e.id === id) || estudiantes[0];
  res.json({
    id_estudiante: est.id,
    nombre: est.nombre,
    tipo_sangre: est.tipo_sangre || 'O+',
    eps: est.eps || 'Sura',
    alergias: est.alergias || 'Maní y Penicilina',
    contacto_emergencia: est.contacto || '3001234567'
  });
});

// HU04 y HU05: Consultar pagos y cargos extra
app.get('/api/pagos', (req, res) => {
  res.json(pagos);
});

app.post('/api/pagos', (req, res) => {
  const nuevoPago = { id: pagos.length + 1, estado: 'Pendiente', ...req.body };
  pagos.push(nuevoPago);
  res.status(201).json(nuevoPago);
});

// HU08 y HU11: Registrar agenda diaria e incidentes
app.get('/api/agenda', (req, res) => {
  res.json(agendas);
});

app.post('/api/agenda', (req, res) => {
  const registro = { id: agendas.length + 1, fecha: new Date().toISOString(), ...req.body };
  agendas.push(registro);
  res.status(201).json(registro);
});

// Ruta principal que entrega el index.html del frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor de KIDS ZONE ejecutándose en: http://localhost:${PORT}`);
});