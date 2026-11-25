require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const { verifyToken, authorize } = require('./middleware/auth');
const {
  User, Student, Payment, Agenda, Incident, Outing, AuditLog, seedInitialData,
} = require('./models/KidsZoneModels');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'kidszone_clave_super_segura_2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const registrarLog = async (usuario, rol, accion) => {
  await AuditLog.create({
    usuario: usuario || 'Sistema',
    rol: rol || 'Sistema',
    accion,
    fecha: new Date().toLocaleString('es-CO'),
  });
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: 'MongoDB', mode: process.env.NODE_ENV || 'development' });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ mensaje: 'Correo y contraseña requeridos' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    if (!await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, nombre: user.nombre },
      JWT_SECRET,
      { expiresIn: '12h' },
    );
    await registrarLog(user.nombre, user.role, `Inicio de sesión exitoso (${user.email})`);
    res.json({ token, user: { id: user._id, nombre: user.nombre, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, correo y contraseña requeridos' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      nombre,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'padre',
    });
    const token = jwt.sign({ id: user._id, role: user.role, nombre: user.nombre }, JWT_SECRET, { expiresIn: '12h' });
    await registrarLog(user.nombre, user.role, `Registro de nueva cuenta (${user.email})`);
    res.status(201).json({ token, user: { id: user._id, nombre: user.nombre, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

app.get('/api/estudiantes', async (req, res) => res.json(await Student.find().sort({ createdAt: -1 })));
app.post('/api/estudiantes', verifyToken, authorize('admin'), async (req, res) => {
  const nuevo = await Student.create({
    id_familia: `FAM-${Math.floor(1000 + Math.random() * 9000)}`,
    boletin: {
      periodo1: { cognitiva: 4.0, motriz: 4.0, socioafectiva: 4.0 },
      periodo2: { cognitiva: 4.3, motriz: 4.4, socioafectiva: 4.5 },
      comentario: 'Estudiante en periodo de adaptación.',
    },
    ...req.body,
  });
  await registrarLog('Administrador', 'admin', `Matriculó a ${nuevo.nombre} (${nuevo.id_familia})`);
  res.status(201).json(nuevo);
});
app.patch('/api/estudiantes/:id/consentimiento', async (req, res) => {
  const est = await Student.findByIdAndUpdate(req.params.id, { consentimiento: req.body.consentimiento }, { new: true });
  if (!est) return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
  await registrarLog('Administrador', 'admin', `Cambió permiso de imagen de ${est.nombre} a ${est.consentimiento}`);
  res.json(est);
});
app.patch('/api/estudiantes/:id/boletin', async (req, res) => {
  const est = await Student.findByIdAndUpdate(req.params.id, { boletin: req.body.boletin }, { new: true });
  if (!est) return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
  res.json(est);
});
app.get('/api/estudiantes/:id/ficha-medica', async (req, res) => {
  const est = await Student.findById(req.params.id).catch(() => null) || await Student.findOne();
  if (!est) return res.status(404).json({ mensaje: 'Sin registros médicos' });
  res.json({
    id: est._id, nombre: est.nombre, tipoSangre: est.tipoSangre, eps: est.eps,
    alergias: est.alergias, vacunas: est.vacunas, medicacion: est.medicacion,
    contactoEmergencia: est.contacto, acudiente: est.acudiente,
  });
});

app.get('/api/pagos', async (req, res) => res.json(await Payment.find().sort({ createdAt: -1 })));
app.post('/api/pagos', async (req, res) => {
  const nuevo = await Payment.create({ fecha: new Date().toISOString().slice(0, 10), metodo: 'Pendiente', estado: 'Pendiente', ...req.body });
  await registrarLog('Administrador', 'admin', `Agregó cargo "${nuevo.concepto}" por $${nuevo.valor}`);
  res.status(201).json(nuevo);
});
app.patch('/api/pagos/:id/pagar', async (req, res) => {
  const pago = await Payment.findByIdAndUpdate(req.params.id, { estado: 'Pagado', metodo: req.body.metodo || 'PSE' }, { new: true });
  if (!pago) return res.status(404).json({ mensaje: 'Pago no encontrado' });
  await registrarLog('Acudiente', 'padre', `Pagó "${pago.concepto}" vía ${pago.metodo}`);
  res.json(pago);
});
app.delete('/api/pagos/:id', async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  await registrarLog('Administrador', 'admin', `Anuló cobro #${req.params.id}`);
  res.json({ ok: true });
});

app.get('/api/agenda', async (req, res) => res.json(await Agenda.find().sort({ createdAt: -1 })));
app.post('/api/agenda', async (req, res) => {
  res.status(201).json(await Agenda.create({ fecha: new Date().toLocaleString('es-CO'), ...req.body }));
});
app.get('/api/incidentes', async (req, res) => res.json(await Incident.find().sort({ createdAt: -1 })));
app.post('/api/incidentes', async (req, res) => {
  res.status(201).json(await Incident.create({ fecha: new Date().toLocaleString('es-CO'), leido: false, ...req.body }));
});
app.patch('/api/incidentes/:id/confirmar', async (req, res) => res.json(await Incident.findByIdAndUpdate(req.params.id, { leido: true }, { new: true })));
app.get('/api/salidas', async (req, res) => res.json(await Outing.find().sort({ createdAt: -1 })));
app.patch('/api/salidas/:id/firmar', async (req, res) => res.json(await Outing.findByIdAndUpdate(req.params.id, { autorizado: true, firma: req.body.firma }, { new: true })));
app.patch('/api/salidas/:id/retorno', async (req, res) => res.json(await Outing.findByIdAndUpdate(req.params.id, { retornoNotificado: true }, { new: true })));
app.get('/api/auditoria', async (req, res) => res.json(await AuditLog.find().sort({ createdAt: -1 }).limit(50)));
app.post('/api/auditoria', async (req, res) => {
  await registrarLog(req.body.usuario, req.body.rol, req.body.accion);
  res.status(201).json({ ok: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

(async () => {
  await connectDB();
  await seedInitialData();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
})();
