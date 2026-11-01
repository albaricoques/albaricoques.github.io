export default function Indicador({ etiqueta, valor, nota }) {
  return (
    <div className="indicador">
      <p className="indicador__etiqueta">{etiqueta}</p>
      <p className="indicador__valor">{valor}</p>
      <p className="indicador__nota">{nota}</p>
    </div>
  )
}
