import Logo from './Logo.jsx'
import Icono from '../ui/Icono.jsx'

export default function EncabezadoAdministracion() {
  return (
    <header className="encabezado">
      <Logo href="#/admin" />
      <div className="encabezado__grupo">
        <a className="encabezado__ayuda" href="#/">
          Vista cliente <Icono nombre="externo" tamano={12} grosor={2} />
        </a>
        <span className="encabezado__insignia">Admin.</span>
      </div>
    </header>
  )
}
