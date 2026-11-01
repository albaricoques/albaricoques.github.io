import { useState } from 'react'
import Icono from './Icono.jsx'

/**
 * Imagen esquemática del restaurante. Si existe el archivo en /public/img se muestra;
 * si no, se ve el marcador de posición del wireframe.
 */
export default function ImagenRestaurante({ src, alt = 'Sala del restaurante La Sobremesa', ratio = '4 / 2.3' }) {
  const [fallo, setFallo] = useState(!src)
  return (
    <div className="imagen" style={{ aspectRatio: ratio }}>
      {!fallo && <img src={src} alt={alt} onError={() => setFallo(true)} />}
      {fallo && (
        <div className="imagen__vacia" role="img" aria-label={alt}>
          <Icono nombre="cubiertos" tamano={36} grosor={1.2} />
          <span>Ilustración del restaurante</span>
        </div>
      )}
    </div>
  )
}
