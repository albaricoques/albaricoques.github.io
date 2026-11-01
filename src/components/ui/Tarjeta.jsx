export default function Tarjeta({ sombra = false, className = '', as: Tag = 'section', children, ...props }) {
  return (
    <Tag className={['tarjeta', sombra && 'tarjeta--sombra', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Tag>
  )
}
