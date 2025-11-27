function ProductList({ products, onEditPrice, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Productos disponibles</h3>
        <p>Lista de todos los productos en stock</p>
      </div>
      <div className="card-content">
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="product-id">{product.codigo || product.id}</td>
                  <td className="product-name">{product.nombre}</td>
                  <td>{product.descripcion}</td>
                  <td>
                    $
                    {Number(product.precio).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <span className={`badge ${product.cantidad > 0 ? "badge-success" : "badge-danger"}`}>
                      {product.cantidad}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="icon-btn price" onClick={() => onEditPrice(product)} title="Editar precio">
                      $
                    </button>
                    <button className="icon-btn edit" onClick={() => onEdit(product)} title="Editar precio y cantidad">
                      &#9998;
                    </button>
                    <button className="icon-btn delete" onClick={() => onDelete(product)} title="Eliminar producto">
                      &#128465;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ProductList
