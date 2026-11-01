import { useEffect, useState } from 'react'

const leer = () => window.location.hash.replace(/^#/, '') || '/'

/** Enrutado mínimo por hash (#/admin/reservas) sin dependencias externas */
export default function useRuta() {
  const [ruta, setRuta] = useState(leer)

  useEffect(() => {
    const alCambiar = () => {
      setRuta(leer())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const navegar = (destino) => {
    window.location.hash = destino
  }
  return [ruta, navegar]
}
