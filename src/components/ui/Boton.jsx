/**
 * Botón/Primario · Botón/Secundario · Botón/Peligro · Botón/Enlace.
 * El estado deshabilitado usa la prop `disabled`. Con `href` se renderiza como enlace.
 */
export default function Boton({ variante = 'secundario', bloque = false, tipo = 'button', className = '', href, children, ...props }) {
  const clases = ['btn', `btn--${variante}`, bloque && 'btn--bloque', className].filter(Boolean).join(' ')
  if (href) {
    return <a href={href} className={clases} {...props}>{children}</a>
  }
  return (
    <button type={tipo} className={clases} {...props}>
      {children}
    </button>
  )
}
