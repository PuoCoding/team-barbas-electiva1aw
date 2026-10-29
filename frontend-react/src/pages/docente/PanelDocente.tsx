import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { peticionAPI } from '../../servicios/api';

interface PanelDocenteProps {
  idEstudiante?: number;
}

interface FichaMedica {
  nombre: string;
  tipo_sangre: string;
  eps: string;
  alergias: string;
  contacto_emergencia: string;
}

interface AgendaDiaria {
  alimentacion: string;
  sueno: string;
  actividades: string;
  incidente: string;
}

const fichaMedicaDemo: FichaMedica = {
  nombre: 'Mateo Gómez',
  tipo_sangre: 'O+',
  eps: 'Sura',
  alergias: 'Maní y Penicilina',
  contacto_emergencia: '3001234567',
};

function esFichaMedica(valor: unknown): valor is FichaMedica {
  if (typeof valor !== 'object' || valor === null) return false;

  return (
    'nombre' in valor &&
    typeof valor.nombre === 'string' &&
    'tipo_sangre' in valor &&
    typeof valor.tipo_sangre === 'string' &&
    'eps' in valor &&
    typeof valor.eps === 'string' &&
    'alergias' in valor &&
    typeof valor.alergias === 'string' &&
    'contacto_emergencia' in valor &&
    typeof valor.contacto_emergencia === 'string'
  );
}

export default function PanelDocente({ idEstudiante = 1 }: PanelDocenteProps) {
  const [ficha, setFicha] = useState<FichaMedica | null>(null);
  const [agenda, setAgenda] = useState<AgendaDiaria>({
    alimentacion: 'Comió todo',
    sueno: '1 hora sin novedad',
    actividades: '',
    incidente: '',
  });
  const [estadoEnvio, setEstadoEnvio] = useState<string>('');

  useEffect(() => {
    async function obtenerFichaMedica() {
      try {
        const datos = await peticionAPI<FichaMedica>(
          `/estudiantes/${idEstudiante}/ficha-medica`,
        );
        setFicha(datos);
        localStorage.setItem(`ficha_medica_${idEstudiante}`, JSON.stringify(datos));
      } catch {
        const cache = localStorage.getItem(`ficha_medica_${idEstudiante}`);
        if (cache) {
          try {
            const datos: unknown = JSON.parse(cache);
            if (esFichaMedica(datos)) {
              setFicha(datos);
              return;
            }
          } catch {
            // Una caché inválida se reemplaza con los datos de demostración.
          }
          setFicha(fichaMedicaDemo);
        } else {
          setFicha(fichaMedicaDemo);
        }
      }
    }
    obtenerFichaMedica();
  }, [idEstudiante]);

  async function guardarAgenda(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await peticionAPI('/agenda', {
        method: 'POST',
        body: JSON.stringify({ id_estudiante: idEstudiante, ...agenda }),
      });
      setEstadoEnvio('Agenda y reporte enviados correctamente al padre de familia.');
    } catch (err: unknown) {
      setEstadoEnvio(
        'Error al guardar en el servidor: ' +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  return (
    <section className="contenedor-responsive">
      <h1 className="titulo-principal">Módulo Docente - Salud y Seguimiento Diario</h1>

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
