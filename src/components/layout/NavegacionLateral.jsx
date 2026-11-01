import Icono from '../ui/Icono.jsx'
import { useReservas } from '../../hooks/useReservas.jsx'
import { FECHA_DEMO } from '../../data/seed.js'
import { fechaSimple } from '../../utils/fechas.js'

const ENLACES = [
  { id: 'panel', texto: 'Panel principal', icono: 'panel', href: '#/admin' },
  { id: 'reservas', texto: 'Consultar reservas', icono: 'calendario', href: '#/admin/reservas' },
  { id: 'nueva', texto: 'Nueva reserva', icono: 'mas', href: '#/admin/nueva' },
  { id: 'editar', texto: 'Editar / Cancelar', icono: 'editar', href: '#/admin/editar' },
]

export default function NavegacionLateral({ activo }) {
  const { reiniciarDatos } = useReservas()
  return (
    <nav className="nav-lateral" aria-label="Operaciones">
      <p className="nav-lateral__seccion">Operaciones</p>
      <ul className="nav-lateral__lista">
        {ENLACES.map((e) => (
          <li key={e.id}>
            <a
              className={`nav-lateral__enlace ${activo === e.id ? 'nav-lateral__enlace--activo' : ''}`.trim()}
              href={e.href}
              aria-current={activo === e.id ? 'page' : undefined}
            >
              <Icono nombre={e.icono} tamano={18} />
              {e.texto}
            </a>
          </li>
        ))}
      </ul>
      <div className="nav-lateral__turno">
        <span>Servicio de cena</span>
        <span>19:00–23:00</span>
        <span>{fechaSimple(FECHA_DEMO)}</span>
      </div>
      <button type="button" className="nav-lateral__reiniciar" onClick={reiniciarDatos}>
        Restablecer datos de demo
      </button>
    </nav>
  )
}
