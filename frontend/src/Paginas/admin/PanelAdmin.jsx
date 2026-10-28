import { useState, useEffect } from 'react';
import { peticionAPI } from '../../services/api';

export default function PanelAdmin() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: '',
    edad: '',
    grado: 'Párvulos',
    nombreAcudiente: '',
    parentesco: 'Madre/Padre',
    contacto: '',
    consentimientoImagen: false,
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  async function cargarEstudiantes() {
    try {
      const data = await peticionAPI('/estudiantes');
      setEstudiantes(data);
    } catch {
      setMensaje('Modo demostración activo o sin conexión al backend.');
    }
  }

  // FUNCIONALIDAD 1: Registrar estudiante vinculado a acudiente (HU01)
  async function registrarEstudiante(e) {
    e.preventDefault();
    try {
      const nuevo = await peticionAPI('/estudiantes', {
        method: 'POST',
        body: JSON.stringify(formulario),
      });
      setEstudiantes([...estudiantes, nuevo]);
      setMensaje(Estudiante registrado con ID Familiar: ${nuevo.id_familia || 'FAM-' + Date.now()});
    } catch (err) {
      setMensaje(Error al registrar: ${err.message});
    }
  }

  // FUNCIONALIDAD 2: Gestionar Consentimiento de Uso de Imagen (HU03)
  async function cambiarConsentimiento(idEstudiante, nuevoEstado) {
    try {
      await peticionAPI(/estudiantes/${idEstudiante}/consentimiento, {
        method: 'PATCH',
        body: JSON.stringify({ autorizado: nuevoEstado }),
      });
      setEstudiantes(
        estudiantes.map((est) =>
          est.id === idEstudiante ? { ...est, consentimientoImagen: nuevoEstado } : est
        )
      );
    } catch (err) {
      alert('No se pudo actualizar el consentimiento: ' + err.message);
    }
  }

  return (
    <section className="contenedor-responsive">
      <h1 className="titulo-principal">Panel Administrativo - Matrículas y Legalidad</h1>
      {mensaje && <p><strong>Estado:</strong> {mensaje}</p>}

      <div className="layout-principal">
        <main>
          <h2>Registrar Estudiante y Acudiente (HU01)</h2>
          <form onSubmit={registrarEstudiante} className="grid-tarjetas">
            <input
              type="text"
              placeholder="Nombre del menor"
              required
              value={formulario.nombre}
              onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            />
            <input
              type="number"
              placeholder="Edad"
              required
              value={formulario.edad}
              onChange={(e) => setFormulario({ ...formulario, edad: e.target.value })}
            />
            <input
              type="text"
              placeholder="Nombre del Acudiente Legal"
              required
              value={formulario.nombreAcudiente}
              onChange={(e) => setFormulario({ ...formulario, nombreAcudiente: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Teléfono de contacto (10 dígitos)"
              required
              value={formulario.contacto}
              onChange={(e) => setFormulario({ ...formulario, contacto: e.target.value })}
            />
            <label>
              <input
                type="checkbox"
                checked={formulario.consentimientoImagen}
                onChange={(e) =>
                  setFormulario({ ...formulario, consentimientoImagen: e.target.checked })
                }
              />
              Autoriza uso de imagen (Ley 1581)
            </label>
            <button type="submit">Vincular y Matricular</button>
          </form>

          <h2>Control de Consentimientos de Imagen (HU03)</h2>
          <div className="grid-tarjetas">
            {estudiantes.map((est) => (
              <article key={est.id} style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px' }}>
                <h3>{est.nombre} ({est.grado})</h3>
                <p>Permiso de fotos: <strong>{est.consentimientoImagen ? 'Aprobado' : 'Negado'}</strong></p>
                <button
                  onClick={() => cambiarConsentimiento(est.id, !est.consentimientoImagen)}
                >
                  {est.consentimientoImagen ? 'Revocar Permiso' : 'Aprobar Permiso'}
                </button>
                {/* Bloqueo automático si el permiso es Negado (RNF-05) */}
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="file"
                    disabled={!est.consentimientoImagen}
                    title={!est.consentimientoImagen ? 'Bloqueado por falta de consentimiento legal' : 'Subir foto'}
                  />
                  {!est.consentimientoImagen && (
                    <small style={{ color: '#dc2626', display: 'block' }}>
                      Subida de fotos bloqueada (Consentimiento Negado)
                    </small>
                  )}
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside>
          <h3>Regla de Negocio</h3>
          <p>Todo menor debe estar vinculado a un acudiente y contar con autorización firmada antes de publicar fotografías.</p>
        </aside>
      </div>
    </section>
  );
}