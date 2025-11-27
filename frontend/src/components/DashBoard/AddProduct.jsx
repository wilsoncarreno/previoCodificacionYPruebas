import { useState } from "react"
import { addProduct } from "../../services/stockService"

function AddProduct({ onProductAdded, onNotify }) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitting(true)
      await addProduct(formData)
      onNotify?.("success", "Producto agregado exitosamente")
      setFormData({ codigo: "", nombre: "", descripcion: "", precio: "", cantidad: "" })
      onProductAdded()
    } catch (error) {
      onNotify?.("error", "No se pudo agregar el producto")
      console.error("addProduct error", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Agregar producto</h3>
        <p>Anadir un nuevo producto al inventario</p>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripcion</label>
            <input
              id="descripcion"
              type="text"
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precio">Precio</label>
              <input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleInputChange("precio", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cantidad">Cantidad</label>
              <input
                id="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={(e) => handleInputChange("cantidad", e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary full-width" disabled={submitting}>
            Agregar producto
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddProduct
