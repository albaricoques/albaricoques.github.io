import useRuta from './hooks/useRuta.js'
import FlujoReserva from './pages/cliente/FlujoReserva.jsx'
import PanelPrincipal from './pages/admin/PanelPrincipal.jsx'
import ConsultarReservas from './pages/admin/ConsultarReservas.jsx'
import NuevaReserva from './pages/admin/NuevaReserva.jsx'
import EditarCancelar from './pages/admin/EditarCancelar.jsx'

export default function App() {
  const [ruta] = useRuta()

  if (ruta === '/admin') return <PanelPrincipal />
  if (ruta === '/admin/reservas') return <ConsultarReservas />
  if (ruta === '/admin/nueva') return <NuevaReserva />
  if (ruta.startsWith('/admin/editar')) return <EditarCancelar codigo={ruta.split('/')[3]} />
  return <FlujoReserva />
}
