import { useState } from 'react';
import { peticionAPI } from '../services/api';

export default function DocenteWorkspace() {
  const [agenda, setAgenda] = useState({ alimentacion: 'Comió todo', sueno: '', actividades: '', incidente: '' });
  const [mensaje, setMensaje] = useState('');

  function actualizar(nombre, valor) {
    setAgenda((actual) => ({ ...actual, [nombre]: valor }));
  }

  async function enviar(event) {
    event.preventDefault();
    try {
      await peticionAPI('/agenda', { method: 'POST', body: JSON.stringify(agenda) });
      setMensaje('Agenda registrada.');
    } catch (error) {
      setMensaje(error.message);
    }
  }

  return (
    <section className="workspace">
      <h1>Módulo Docente</h1>
      <form onSubmit={enviar}>
        <select value={agenda.alimentacion} onChange={(event) => actualizar('alimentacion', event.target.value)}>
          <option>Comió todo</option><option>Parcial</option><option>Nada</option>
        </select>
        <input value={agenda.sueno} onChange={(event) => actualizar('sueno', event.target.value)} placeholder="Sueño" />
        <textarea value={agenda.actividades} onChange={(event) => actualizar('actividades', event.target.value)} placeholder="Actividades" />
        <button>Guardar agenda</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </section>
  );
}
