import { useEffect, useState } from 'react';
import { peticionAPI } from '../../services/api.js';

export default function PadreWorkspace() {
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    peticionAPI('/pagos').then(setPagos).catch(() => setPagos([
      { id: 1, concepto: 'Mensualidad Octubre', valor: 450000, estado: 'Pendiente' },
    ]));
  }, []);

  return (
    <section className="workspace">
      <h1>Portal de Padres</h1>
      {pagos.map((pago) => (
        <article key={pago.id}>
          <h2>{pago.concepto}</h2>
          <p>${pago.valor.toLocaleString('es-CO')} - {pago.estado}</p>
        </article>
      ))}
    </section>
  );
}
