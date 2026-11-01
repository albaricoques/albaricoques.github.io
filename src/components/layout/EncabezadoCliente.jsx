import Logo from './Logo.jsx'
import Icono from '../ui/Icono.jsx'
import { RESTAURANTE } from '../../data/seed.js'

export default function EncabezadoCliente() {
  return (
    <header className="encabezado">
      <Logo href="#/" />
      <a className="encabezado__ayuda" href={`tel:${RESTAURANTE.telefono.replace(/\s/g, '')}`}>
        Ayuda <Icono nombre="externo" tamano={12} grosor={2} />
      </a>
    </header>
  )
}
