function MovementHistory({ movements }) {
  const badgeClass = (tipo) => {
    if (tipo === "entrada") return "badge-success"
    if (tipo === "salida") return "badge-danger"
    return "badge-neutral"
  }

  const tipoLabel = (tipo) => {
    if (tipo === "entrada") return "Entrada"
    if (tipo === "salida") return "Salida"
    return "Ajuste"
  }

  const formatDateTime = (fecha, hora) => {
    if (!fecha && !hora) return "N/A"
    const candidate = hora ? `${fecha}T${hora}` : fecha
    const date = new Date(candidate)
    if (Number.isNaN(date.getTime())) return `${fecha || ""} ${hora || ""}`.trim() || "N/A"
    const day = date.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" })
    const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    return `${day} ${time}`
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Historial de movimientos</h3>
        <p>Registro de entradas, salidas y ajustes de productos</p>
      </div>
      <div className="card-content">
        {movements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>No hay movimientos registrados</div>
        ) : (
          <div className="table-container">
            <table className="movements-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripcion</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                 
                </tr>
              </thead>
              <tbody>
                {movements.map((movement, index) => (
                  <tr key={movement.id || index} className={`movement-row ${movement.tipo}`}>
                    
        
                    <td className="product-name">{movement.nombre || "N/A"}</td>
                    <td>{movement.descripcion || "N/A"}</td>
                    <td>
                      $
                      {Number(movement.precio || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>{movement.cantidad || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MovementHistory
