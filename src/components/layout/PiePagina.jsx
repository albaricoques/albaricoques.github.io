import { RESTAURANTE } from '../../data/seed.js'

export default function PiePagina() {
  return (
    <footer className="pie">
      <span>¿Necesitas ayuda?&nbsp; {RESTAURANTE.telefono}</span>
      <span>{RESTAURANTE.direccion}</span>
    </footer>
  )
}
