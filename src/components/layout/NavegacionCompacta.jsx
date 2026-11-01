/** Navegación compacta de móvil: Panel · Reservas · + Nueva */
export default function NavegacionCompacta({ activo }) {
  return (
    <nav className="nav-compacta" aria-label="Operaciones">
      <a href="#/admin" className={activo === 'panel' ? 'activo' : ''}>Panel</a>
      <a href="#/admin/reservas" className={activo === 'reservas' || activo === 'editar' ? 'activo' : ''}>Reservas</a>
      <a href="#/admin/nueva" className={activo === 'nueva' ? 'activo' : ''}>+ Nueva</a>
    </nav>
  )
}
