"use client"

import { useState, useEffect } from "react"
import { fetchProducts, updateProduct, deleteProduct } from "../../services/stockService"
import { fetchMovements } from "../../services/movementService"
import ProductList from "./ProductList"
import AddProduct from "./AddProduct"
import MovementHistory from "./MovementHistory"
import Tabs from "./Tabs"
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
