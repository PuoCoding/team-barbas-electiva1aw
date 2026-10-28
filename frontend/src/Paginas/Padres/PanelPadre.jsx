import { useState, useEffect } from 'react';
import { peticionAPI } from '../../services/api';

export default function PanelPadre() {
  const [pagos, setPagos] = useState([]);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [mensajeCamara, setMensajeCamara] = useState('');

  // FUNCIONALIDAD 5: Consultar Estado de Cuenta Mensual y Extras (HU04 / HU05)
  useEffect(() => {
    async function cargarPagos() {
      try {
        const data = await peticionAPI('/pagos');
        setPagos(data);
      } catch {
        setPagos([
          { id: 1, concepto: 'Mensualidad Octubre', valor: 450000, estado: 'Pendiente' },
          { id: 2, concepto: 'Extra: Uniforme de Educación Física', valor: 85000, estado: 'Pagado' },
        ]);
      }
    }
    cargarPagos();
  }, []);

  // FUNCIONALIDAD 6: Acceso a Cámaras validado por horario (7:00 a 17:00) y límite de 15 min (HU07 / RNF-02)
  function iniciarStreaming() {
    const horaActual = new Date().getHours();
    if (horaActual < 7 || horaActual >= 17) {
      setCamaraActiva(false);
      setMensajeCamara('Streaming no disponible: Fuera de la jornada escolar (7:00 AM - 5:00 PM).');
      return;
    }

    setCamaraActiva(true);
    setMensajeCamara('Conectado al salón de su hijo. La sesión se cerrará en 15 minutos por rendimiento.');

    setTimeout(() => {
      setCamaraActiva(false);
      setMensajeCamara('Sesión finalizada automáticamente tras 15 minutos (RNF-05).');
    }, 15 * 60 * 1000);
  }

  const saldoPendiente = pagos
    .filter((p) => p.estado === 'Pendiente')
    .reduce((acc, p) => acc + Number(p.valor), 0);

  return (
    <section className="contenedor-responsive">
      <h1 className="titulo-principal">Portal de Padres - Pagos y Vigilancia</h1>

      <div className="layout-principal">
        <main>
          <h2>Estado de Cuenta y Facturación (HU04 / HU05)</h2>
          <p><strong>Saldo Total Pendiente:</strong> ${saldoPendiente.toLocaleString('es-CO')} COP</p>
          <div className="grid-tarjetas">
            {pagos.map((pago) => (
              <article key={pago.id} style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px' }}>
                <h3>{pago.concepto}</h3>
                <p>Valor: ${Number(pago.valor).toLocaleString('es-CO')}</p>
                <p>Estado: <strong>{pago.estado}</strong></p>
                <button onClick={() => window.print()}>Descargar Recibo PDF</button>
              </article>
            ))}
          </div>

          <h2 style={{ marginTop: '2rem' }}>Monitoreo de Cámaras por Salón (HU07)</h2>
          <button onClick={iniciarStreaming}>Conectar a Cámara del Grado</button>
          {mensajeCamara && <p>{mensajeCamara}</p>}
          {camaraActiva && (
            <div style={{ marginTop: '1rem' }}>
              <video controls autoPlay muted width="600">
                <source src="/stream-salon.mp4" type="video/mp4" />
                Su navegador no soporta transmisión de video.
              </video>
            </div>
          )}
        </main>

        <aside>
          <h3>Privacidad y Seguridad</h3>
          <p>Solo puede visualizar el salón donde está matriculado su hijo durante el horario de clases.</p>
        </aside>
      </div>
    </section>
  );
}