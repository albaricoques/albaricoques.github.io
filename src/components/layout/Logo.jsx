import Icono from '../ui/Icono.jsx'
import { RESTAURANTE } from '../../data/seed.js'

export default function Logo({ href = '#/' }) {
  return (
    <a className="logo" href={href} aria-label={`${RESTAURANTE.nombre}, inicio`}>
      <Icono nombre="logo" tamano={24} grosor={1.5} />
      {RESTAURANTE.nombre}
    </a>
  )
}
