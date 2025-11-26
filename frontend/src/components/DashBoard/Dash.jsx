"use client"

import { useState, useEffect } from "react"
import { fetchProducts, addProduct, restockProduct, subtractProduct, updateProduct, deleteProduct } from "../../services/stockService"
import { fetchMovements } from "../../services/movementService"
import "./Dash.css"

const AUTO_REFRESH_MS = 10000

// Componente del Sidebar
function AppSidebar({ activeSection, setActiveSection, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">[]</span>
          <span className="logo-text">Stock Manager</span>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-group">
          <div className="sidebar-group-label">Gestion</div>
          <div className="sidebar-menu">
            <button
              className={`sidebar-menu-item ${activeSection === "stock" ? "active" : ""}`}
              onClick={() => setActiveSection("stock")}
            >
              <span className="menu-icon">[]</span>
              <span>Stock Manager</span>
            </button>
            <button
              className={`sidebar-menu-item ${activeSection === "account" ? "active" : ""}`}
              onClick={() => setActiveSection("account")}
            >
              <span className="menu-icon">@</span>
              <span>Mi Cuenta</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-menu-item logout-btn" onClick={onLogout}>
          <span className="menu-icon"></span>
          <span>Cerrar Sesion</span>
        </button>
      </div>
    </div>
  )
}

// Componente para mostrar productos
function ProductList({ products, onRefresh, onEdit, onDelete }) {
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
                <th>ID</th>
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
                  <td className="product-id">{product.id}</td>
                  <td className="product-name">{product.nombre}</td>
                  <td>{product.descripcion}</td>
                  <td>${Number(product.precio).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${product.cantidad > 0 ? "badge-success" : "badge-danger"}`}>
                      {product.cantidad}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="icon-btn edit" onClick={() => onEdit(product)} title="Editar precio/cantidad">
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

// Componente para agregar productos
function AddProduct({ onProductAdded, onNotify }) {
  const [formData, setFormData] = useState({
    id: "",
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
      setFormData({ id: "", nombre: "", descripcion: "", precio: "", cantidad: "" })
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
              <label htmlFor="id">ID del Producto</label>
              <input
                id="id"
                type="text"
                value={formData.id}
                onChange={(e) => handleInputChange("id", e.target.value)}
                required
              />
            </div>
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

// Componente para reabastecer productos
function RestockProduct({ onProductUpdated, onNotify }) {
  const [formData, setFormData] = useState({
    id: "",
    cantidad: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitting(true)
      await restockProduct(formData)
      onNotify?.("success", "Producto reabastecido exitosamente")
      setFormData({ id: "", cantidad: "" })
      onProductUpdated()
    } catch (error) {
      onNotify?.("error", "No se pudo reabastecer el producto")
      console.error("restockProduct error", error)
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
        <h3>Reabastecer producto</h3>
        <p>Aumentar la cantidad de un producto existente</p>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="restock-id">ID del Producto</label>
            <input
              id="restock-id"
              type="text"
              value={formData.id}
              onChange={(e) => handleInputChange("id", e.target.value)}
              placeholder="Ingrese el ID del producto"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="restock-cantidad">Cantidad a agregar</label>
            <input
              id="restock-cantidad"
              type="number"
              min="1"
              value={formData.cantidad}
              onChange={(e) => handleInputChange("cantidad", e.target.value)}
              placeholder="Cantidad a agregar"
              required
            />
          </div>

          <button type="submit" className="btn btn-success full-width" disabled={submitting}>
            Reabastecer producto
          </button>
        </form>
      </div>
    </div>
  )
}

// Componente para descontar productos
function SubtractProduct({ onProductUpdated, onNotify }) {
  const [formData, setFormData] = useState({
    id: "",
    cantidad: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitting(true)
      await subtractProduct(formData)
      onNotify?.("success", "Producto descontado exitosamente")
      setFormData({ id: "", cantidad: "" })
      onProductUpdated()
    } catch (error) {
      onNotify?.("error", "No se pudo descontar el producto")
      console.error("subtractProduct error", error)
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
        <h3>Descontar producto</h3>
        <p>Reducir la cantidad de un producto existente</p>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="product-id">ID del Producto</label>
            <input
              id="product-id"
              type="text"
              value={formData.id}
              onChange={(e) => handleInputChange("id", e.target.value)}
              placeholder="Ingrese el ID del producto"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subtract-cantidad">Cantidad a descontar</label>
            <input
              id="subtract-cantidad"
              type="number"
              min="1"
              value={formData.cantidad}
              onChange={(e) => handleInputChange("cantidad", e.target.value)}
              placeholder="Cantidad a descontar"
              required
            />
          </div>

          <button type="submit" className="btn btn-danger full-width" disabled={submitting}>
            Descontar producto
          </button>
        </form>
      </div>
    </div>
  )
}

// Componente para mostrar movimientos
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
                  <th>Fecha</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement, index) => (
                  <tr key={movement.id || index} className={`movement-row ${movement.tipo}`}>
                    
                    <td className="product-name">{movement.nombre || "N/A"}</td>
                    <td>{movement.descripcion || "N/A"}</td>
                    <td>${Number(movement.precio || 0).toFixed(2)}</td>
                    <td>{movement.cantidad || 0}</td>
                    <td>{movement.fecha || "N/A"}</td>
                    <td>{movement.hora || "N/A"}</td>
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
// Componente de pestanas
function Tabs({ activeTab, setActiveTab, children }) {
  return (
    <div className="tabs-container">
      <div className="tabs-list">
        <button
          className={`tab-button ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Productos
        </button>
        <button className={`tab-button ${activeTab === "add" ? "active" : ""}`} onClick={() => setActiveTab("add")}>
          Agregar
        </button>
        <button
          className={`tab-button ${activeTab === "movements" ? "active" : ""}`}
          onClick={() => setActiveTab("movements")}
        >
          Movimientos
        </button>
      </div>
      <div className="tab-content">{children}</div>
    </div>
  )
}

// Componente principal del Dashboard
export default function Dashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("stock")
  const [activeTab, setActiveTab] = useState("products")
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState({ precio: "", cantidad: "" })

  const notify = (type, message) => setStatus({ type, message })

  useEffect(() => {
    if (!status) return
    const timer = setTimeout(() => setStatus(null), 4000)
    return () => clearTimeout(timer)
  }, [status])

  const openEditModal = (product) => {
    setEditingProduct(product)
    setEditForm({
      precio: product.precio ?? "",
      cantidad: product.cantidad ?? "",
    })
  }

  const closeEditModal = () => {
    setEditingProduct(null)
    setEditForm({ precio: "", cantidad: "" })
  }

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingProduct) return
    try {
      await updateProduct({
        id: editingProduct.id,
        precio: editForm.precio,
        cantidad: editForm.cantidad,
      })
      notify("success", "Producto actualizado")
      closeEditModal()
      refreshData()
    } catch (err) {
      console.error("updateProduct error", err)
      notify("error", "No se pudo actualizar el producto")
    }
  }

  const handleDelete = async (product) => {
    const ok = window.confirm(`Eliminar producto ${product.nombre}?`)
    if (!ok) return
    try {
      await deleteProduct(product.id)
      notify("success", "Producto eliminado")
      refreshData()
    } catch (err) {
      console.error("deleteProduct error", err)
      notify("error", "No se pudo eliminar el producto")
    }
  }

  // Funcion para cargar productos
  const loadProducts = async () => {
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  // Funcion para cargar movimientos (real)
  const loadMovements = async () => {
    try {
      const processedMovements = await fetchMovements()
      setMovements(processedMovements)
    } catch (error) {
      console.error("Error loading movements:", error)
      // En caso de error, mantener un array vacio
      setMovements([])
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadProducts(), loadMovements()])
      setLoading(false)
    }
    loadData()
  }, [])

  const refreshData = () => {
    loadProducts()
    loadMovements()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, AUTO_REFRESH_MS)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">[]</div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={onLogout} />

      <div className="main-content">
        {status && <div className={`status-banner ${status.type}`}>{status.message}</div>}

        {editingProduct && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Editar producto</h3>
                <button className="icon-btn close" onClick={closeEditModal} title="Cerrar">
                  x
                </button>
              </div>
              <form className="modal-body" onSubmit={handleEditSubmit}>
                <label>
                  Precio
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.precio}
                    onChange={(e) => handleEditChange("precio", e.target.value)}
                  />
                </label>
                <label>
                  Cantidad
                  <input
                    type="number"
                    value={editForm.cantidad}
                    onChange={(e) => handleEditChange("cantidad", e.target.value)}
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" className="btn secondary" onClick={closeEditModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn primary">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <header className="dashboard-header">
          <div className="header-left">
            <h1>{activeSection === "stock" ? "Gestion de Stock" : "Mi Cuenta"}</h1>
            <span className="auto-refresh-note">Actualiza automaticamente cada 10s</span>
          </div>
        </header>

        <main className="dashboard-main">
          {activeSection === "stock" && (
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab}>
              {activeTab === "products" && (
                <ProductList
                  products={products}
                  onRefresh={refreshData}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === "add" && <AddProduct onProductAdded={refreshData} onNotify={notify} />}
              {activeTab === "movements" && <MovementHistory movements={movements} />}
            </Tabs>
          )}

          {activeSection === "account" && (
            <div className="card">
              <div className="card-header">
                <h3>Mi Cuenta</h3>
                <p>Informacion de la cuenta de usuario</p>
              </div>
              <div className="card-content">
                <p>Aqui puedes gestionar la informacion de tu cuenta.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
