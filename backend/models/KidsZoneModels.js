const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'docente', 'padre'], default: 'padre' },
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  id_familia: { type: String, required: true },
  nombre: { type: String, required: true },
  edad: Number,
  grado: { type: String, default: 'Jardín' },
  acudiente: String,
  parentesco: { type: String, default: 'Acudiente' },
  contacto: String,
  correo: String,
  consentimiento: { type: String, enum: ['Aprobado', 'Parcial', 'Negado'], default: 'Negado' },
  tipoSangre: { type: String, default: 'O+' },
  eps: { type: String, default: 'Sura' },
  alergias: { type: String, default: 'Ninguna' },
  vacunas: { type: String, default: 'Esquema PAI al día' },
  medicacion: { type: String, default: 'Sin medicación permanente' },
  boletin: {
    periodo1: { cognitiva: Number, motriz: Number, socioafectiva: Number },
    periodo2: { cognitiva: Number, motriz: Number, socioafectiva: Number },
    comentario: String,
  },
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  id_familia: String,
  estudiante: String,
  concepto: String,
  valor: Number,
  fecha: String,
  metodo: { type: String, default: 'Pendiente' },
  estado: { type: String, enum: ['Pendiente', 'Pagado'], default: 'Pendiente' },
}, { timestamps: true });

const agendaSchema = new mongoose.Schema({
  estudiante: String,
  grado: String,
  alimentacion: String,
  sueno: String,
  esfinteres: String,
  actividad: String,
  fecha: String,
}, { timestamps: true });

const incidentSchema = new mongoose.Schema({
  estudiante: String,
  tipo: String,
  descripcion: String,
  evidencia: String,
  fecha: String,
  leido: { type: Boolean, default: false },
}, { timestamps: true });

const outingSchema = new mongoose.Schema({
  titulo: String,
  fecha: String,
  grado: String,
  estudiante: String,
  autorizado: { type: Boolean, default: false },
  firma: { type: String, default: '' },
  retornoNotificado: { type: Boolean, default: false },
}, { timestamps: true });

const auditSchema = new mongoose.Schema({
  usuario: String,
  rol: String,
  accion: String,
  fecha: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Agenda = mongoose.model('Agenda', agendaSchema);
const Incident = mongoose.model('Incident', incidentSchema);
const Outing = mongoose.model('Outing', outingSchema);
const AuditLog = mongoose.model('AuditLog', auditSchema);

async function seedInitialData() {
  if (await User.countDocuments() === 0) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.insertMany([
      { nombre: 'Dirección General', email: 'admin@kidszone.edu', password: hashedPassword, role: 'admin' },
      { nombre: 'Prof. Mariana Ruiz', email: 'docente@kidszone.edu', password: hashedPassword, role: 'docente' },
      { nombre: 'Laura Gómez', email: 'padre@kidszone.edu', password: hashedPassword, role: 'padre' },
    ]);
  }

  if (await Student.countDocuments() === 0) {
    await Student.insertMany([
      {
        id_familia: 'FAM-1001', nombre: 'Mateo Gómez', edad: 4, grado: 'Jardín',
        acudiente: 'Laura Gómez', parentesco: 'Madre', contacto: '3001234567',
        correo: 'padre@kidszone.edu', consentimiento: 'Negado', tipoSangre: 'O+', eps: 'Sura',
        alergias: 'Maní y Penicilina', vacunas: 'Esquema PAI completo',
        medicacion: 'Inhalador Salbutamol si presenta fatiga',
        boletin: {
          periodo1: { cognitiva: 4.2, motriz: 4.4, socioafectiva: 4.1 },
          periodo2: { cognitiva: 4.7, motriz: 4.8, socioafectiva: 4.6 },
          comentario: 'Excelente progreso en trazos, reconocimiento de vocales y trabajo en equipo.',
        },
      },
      {
        id_familia: 'FAM-1002', nombre: 'Sofía Martínez', edad: 3, grado: 'Párvulos',
        acudiente: 'Carlos Martínez', parentesco: 'Padre', contacto: '3119876543',
        correo: 'carlos.m@correo.com', consentimiento: 'Parcial', tipoSangre: 'A+', eps: 'Sanitas',
        alergias: 'Intolerancia a la lactosa', vacunas: 'Pendiente refuerzo influenza', medicacion: 'Ninguna',
        boletin: {
          periodo1: { cognitiva: 4.0, motriz: 4.2, socioafectiva: 4.5 },
          periodo2: { cognitiva: 4.5, motriz: 4.6, socioafectiva: 4.9 },
          comentario: 'Destaca por su expresión oral y participación en rondas musicales.',
        },
      },
    ]);

    await Payment.insertMany([
      { id_familia: 'FAM-1001', estudiante: 'Mateo Gómez', concepto: 'Mensualidad Noviembre', valor: 450000, fecha: '2026-11-05', metodo: 'Pendiente', estado: 'Pendiente' },
      { id_familia: 'FAM-1001', estudiante: 'Mateo Gómez', concepto: 'Extra: Uniforme Deportivo', valor: 85000, fecha: '2026-11-10', metodo: 'PSE', estado: 'Pagado' },
    ]);
    await Agenda.create({ estudiante: 'Mateo Gómez', grado: 'Jardín', alimentacion: 'Comió todo', sueno: '1h 15min sin novedad', esfinteres: 'Control normal', actividad: 'Taller de pintura dactilar y reconocimiento de vocales.', fecha: new Date().toLocaleString('es-CO') });
    await Incident.create({ estudiante: 'Mateo Gómez', tipo: 'Salud', descripcion: 'Leve rasguño en rodilla durante recreo. Limpiado con solución salina.', evidencia: '1 fotografía adjunta', fecha: new Date().toLocaleString('es-CO'), leido: false });
    await Outing.create({ titulo: 'Visita al Museo de Historia Natural', fecha: '2026-12-04', grado: 'Jardín', estudiante: 'Mateo Gómez', autorizado: false, firma: '', retornoNotificado: false });
    await AuditLog.create({ usuario: 'Sistema', rol: 'Admin', accion: 'Base de datos MongoDB inicializada con cifrado y control RBAC', fecha: new Date().toLocaleString('es-CO') });
  }
}

module.exports = { User, Student, Payment, Agenda, Incident, Outing, AuditLog, seedInitialData };
