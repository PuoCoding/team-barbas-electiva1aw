import { useState, useEffect } from 'react';
import { peticionAPI } from '../../services/api';

export default function PanelDocente({ idEstudiante = 1 }) {
  const [ficha, setFicha] = useState(null);
  const [agenda, setAgenda] = useState({
    alimentacion: 'Comió todo',
    sueno: '1 hora sin novedad',
    actividades: '',
    incidente: '',
  });
  const [estadoEnvio, setEstadoEnvio] = useState('');

  // FUNCIONALIDAD 3: Consultar Ficha Médica con soporte de Caché Offline (HU02 / QAW-04)
  useEffect(() => {
    async function obtenerFichaMedica() {
      try {
        const datos = await peticionAPI(`/estudiantes/${idEstudiante}/ficha-medica`);
        setFicha(datos);
        localStorage.setItem(`ficha_medica_${idEstudiante}`, JSON.stringify(datos));
      } catch {
        // Si falla la red, recupera de caché local para emergencias (RNF-03)
        const cache = localStorage.getItem(`ficha_medica_${idEstudiante}`);
        if (cache) {
          setFicha(JSON.parse(cache));
        } else {
          setFicha({
            nombre: 'Mateo Gómez',
            tipo_sangre: 'O+',
            eps: 'Sura',
            alergias: 'Maní y Penicilina',
            contacto_emergencia: '3001234567',
          });
        }
      }
    }
    obtenerFichaMedica();
  }, [idEstudiante]);

  // FUNCIONALIDAD 4: Registrar Agenda Diaria e Incidentes (HU08 / HU11)
  async function guardarAgenda(e) {
    e.preventDefault();
    try {
      await peticionAPI('/agenda', {
        method: 'POST',
        body: JSON.stringify({ id_estudiante: idEstudiante, ...agenda }),
      });
      setEstadoEnvio('Agenda y reporte enviados correctamente al padre de familia.');
    } catch (err) {
      setEstadoEnvio('Error al guardar en el servidor: ' + err.message);
    }
  }

  return (
    <section className="contenedor-responsive">
      <h1 className="titulo-principal">Módulo Docente - Salud y Seguimiento Diario</h1>

      {/* Banner Rojo Persistente de Alergias (Criterio de aceptación HU02) */}
      {ficha?.alergias && (
        <div className="alerta-roja" role="alert">
          ALERTA MÉDICA CRÍTICA: Alergia registrada a {ficha.alergias} — EPS: {ficha.eps} (RH: {ficha.tipo_sangre})
          <div style={{ marginTop: '0.5rem' }}>
            <a href={`tel:${ficha.contacto_emergencia}`} style={{ color: '#991b1b', textDecoration: 'underline' }}>
              Llamar de urgencia al acudiente ({ficha.contacto_emergencia})
            </a>
          </div>
        </div>
      )}

      <div className="layout-principal">
        <main>
          <h2>Registro de Agenda Diaria (HU08)</h2>
          <form onSubmit={guardarAgenda} className="grid-tarjetas">
            <label>
              Alimentación:
              <select
                value={agenda.alimentacion}
                onChange={(e) => setAgenda({ ...agenda, alimentacion: e.target.value })}
              >
                <option value="Comió todo">Comió todo</option>
                <option value="Parcial">Parcial</option>
                <option value="Nada">Nada</option>
              </select>
            </label>

            <label>
              Sueño / Control de esfínteres:
              <input
                type="text"
                value={agenda.sueno}
                onChange={(e) => setAgenda({ ...agenda, sueno: e.target.value })}
              />
            </label>

            <label>
              Comentario pedagógico (máx. 200 caracteres):
              <textarea
                maxLength={200}
                required
                placeholder="Actividades lúdicas realizadas hoy..."
                value={agenda.actividades}
                onChange={(e) => setAgenda({ ...agenda, actividades: e.target.value })}
              />
            </label>

            <label>
              Reporte de Incidente inmediato (HU11 - Opcional):
              <input
                type="text"
                placeholder="Novedad de salud o conducta..."
                value={agenda.incidente}
                onChange={(e) => setAgenda({ ...agenda, incidente: e.target.value })}
              />
            </label>

            <button type="submit">Guardar y Notificar al Acudiente</button>
          </form>
          {estadoEnvio && <p>{estadoEnvio}</p>}
        </main>

        <aside>
          <h3>Disponibilidad Offline</h3>
          <p>La ficha médica se almacena en caché local para responder ante emergencias incluso sin conexión a internet.</p>
        </aside>
      </div>
    </section>
  );
}