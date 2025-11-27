"use client"

import { useState, useEffect } from "react"
import { fetchProducts, addProduct, updateProduct, deleteProduct } from "../../services/stockService"
import { fetchMovements } from "../../services/movementService"
import "./Dash.css"

const AUTO_REFRESH_MS = 10000

function StatusBanner({ status }) {
  if (!status) return null
  return <div className={`status-banner ${status.type}`}>{status.message}</div>
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn close" onClick={onClose} title="Cerrar">
            x
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

// Componente del Sidebar
function AppSidebar({ activeSection, setActiveSection, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">SM</span>
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
              <span className="menu-icon">-</span>
              <span>Stock Manager</span>
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
function ProductList({ products, onRefresh, onEditPrice, onEdit, onDelete }) {
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
                  <td>${Number(product.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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

// Componente para agregar productos
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
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Descripcion</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
             
                </tr>
              </thead>
              <tbody>
                {movements.map((movement, index) => (
                  <tr key={movement.id || index} className={`movement-row ${movement.tipo}`}>
                    <td>
                      <span className={`badge ${badgeClass(movement.tipo)}`}>
                        {tipoLabel(movement.tipo)}
                      </span>
                    </td>
                    <td className="product-name">{movement.nombre || "N/A"}</td>
                    <td>{movement.descripcion || "N/A"}</td>
                    <td>${Number(movement.precio || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
  const [editingPriceProduct, setEditingPriceProduct] = useState(null)
  const [priceForm, setPriceForm] = useState({ precio: "" })

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

  const openPriceModal = (product) => {
    setEditingPriceProduct(product)
    setPriceForm({ precio: product.precio ?? "" })
  }

  const closePriceModal = () => {
    setEditingPriceProduct(null)
    setPriceForm({ precio: "" })
  }

  const handlePriceChange = (value) => {
    setPriceForm({ precio: value })
  }

  const handlePriceSubmit = async (e) => {
    e.preventDefault()
    if (!editingPriceProduct) return
    try {
      await updateProduct({
        id: editingPriceProduct.id,
        precio: priceForm.precio,
      })
      notify("success", "Precio actualizado")
      closePriceModal()
      refreshData()
    } catch (err) {
      console.error("update price error", err)
      notify("error", "No se pudo actualizar el precio")
    }
  }

  // Funcion para cargar productos
  const loadProducts = async () => {
    try {
      const { items } = await fetchProducts()
      setProducts(items)
    } catch (error) {
      console.error("Error loading products:", error)
      notify("error", "No se pudieron cargar los productos")
    }
  }

  // Funcion para cargar movimientos (real)
  const loadMovements = async () => {
    try {
      const { items } = await fetchMovements()
      setMovements(items)
    } catch (error) {
      console.error("Error loading movements:", error)
      // En caso de error, mantener un array vacio
      setMovements([])
      notify("error", "No se pudieron cargar los movimientos")
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
        <StatusBanner status={status} />

        {editingProduct && (
          <Modal title="Editar producto" onClose={closeEditModal}>
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
          </Modal>
        )}

        {editingPriceProduct && (
          <Modal title="Editar precio" onClose={closePriceModal}>
            <form className="modal-body" onSubmit={handlePriceSubmit}>
              <label>
                Precio
                <input
                  type="number"
                  step="0.01"
                  value={priceForm.precio}
                  onChange={(e) => handlePriceChange(e.target.value)}
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={closePriceModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  Guardar
                </button>
              </div>
            </form>
          </Modal>
        )}

        <header className="dashboard-header">
          <div className="header-left">
            <h1>{activeSection === "stock" ? "Gestion de Stock" : "Mi Cuenta"}</h1>
          </div>
        </header>

        <main className="dashboard-main">
          {activeSection === "stock" && (
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab}>
              {activeTab === "products" && (
                <ProductList
                  products={products}
                  onRefresh={refreshData}
                  onEditPrice={openPriceModal}
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
