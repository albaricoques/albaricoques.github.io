import Logo from './Logo.jsx'

export default function EncabezadoAdministracion() {
  return (
    <header className="encabezado">
      <Logo href="#/admin" />
      <span className="encabezado__insignia">Admin.</span>
    </header>
  )
}
