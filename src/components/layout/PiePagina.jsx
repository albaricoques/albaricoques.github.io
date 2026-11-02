import { RESTAURANTE } from '../../data/seed.js'

export default function PiePagina() {
  return (
    <footer className="pie">
      <span>¿Necesitas ayuda?&nbsp; {RESTAURANTE.telefono}</span>
      <a className="pie__enlace" href="#/admin">Acceso administración</a>
      <span>{RESTAURANTE.direccion}</span>
    </footer>
  )
}
