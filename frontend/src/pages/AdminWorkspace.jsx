import { useEffect, useState } from 'react';
import { peticionAPI } from '../services/api';

export default function AdminWorkspace() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    peticionAPI('/estudiantes')
      .then(setEstudiantes)
      .catch(() => setMensaje('Modo demostración activo.'));
  }, []);

  async function registrar(event) {
    event.preventDefault();
    try {
      const nuevo = await peticionAPI('/estudiantes', {
        method: 'POST',
        body: JSON.stringify({ nombre, edad: 4, grado: 'Jardín' }),
      });
      setEstudiantes((actuales) => [...actuales, nuevo]);
      setNombre('');
    } catch (error) {
      setMensaje(error.message);
    }
  }

  return (
    <section className="workspace">
      <h1>Panel Administrativo</h1>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={registrar}>
        <input value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Nombre del estudiante" required />
        <button>Registrar matrícula</button>
      </form>
      {estudiantes.map((estudiante) => <article key={estudiante.id}>{estudiante.nombre}</article>)}
    </section>
  );
}
