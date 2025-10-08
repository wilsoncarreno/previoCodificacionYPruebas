"use client"

import { useState, useEffect } from "react"
import "./Dash.css"

// Componente del Sidebar
function AppSidebar({ activeSection, setActiveSection, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">📦</span>
          <span className="logo-text">Stock Manager</span>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-group">
          <div className="sidebar-group-label">Gestión</div>
          <div className="sidebar-menu">
            <button
              className={`sidebar-menu-item ${activeSection === "stock" ? "active" : ""}`}
              onClick={() => setActiveSection("stock")}
            >
              <span className="menu-icon">📦</span>
              <span>Stock Manager</span>
            </button>
            <button
              className={`sidebar-menu-item ${activeSection === "account" ? "active" : ""}`}
              onClick={() => setActiveSection("account")}
            >
              <span className="menu-icon">👤</span>
              <span>Mi Cuenta</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-menu-item logout-btn" onClick={onLogout}>
          <span className="menu-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

// Componente para mostrar productos
function ProductList({ products, onRefresh }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Productos Disponibles</h3>
        <p>Lista de todos los productos en stock</p>
      </div>
      <div className="card-content">
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Cantidad</th>
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
function AddProduct({ onProductAdded }) {
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:8000/api/stock/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formData.id,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: Number.parseFloat(formData.precio),
          cantidad: Number.parseInt(formData.cantidad),
        }),
      })

      if (response.ok) {
        alert("Producto agregado exitosamente")
        setFormData({ id: "", nombre: "", descripcion: "", precio: "", cantidad: "" })
        onProductAdded()
      } else {
        throw new Error("Error al agregar producto")
      }
    } catch (error) {
      alert("No se pudo agregar el producto")
      console.error(error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>➕ Agregar Producto</h3>
        <p>Añadir un nuevo producto al inventario</p>
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
            <label htmlFor="descripcion">Descripción</label>
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

          <button type="submit" className="btn btn-primary full-width">
            ➕ Agregar Producto
          </button>
        </form>
      </div>
    </div>
  )
}

// Componente para reabastecer productos
function RestockProduct({ onProductUpdated }) {
  const [formData, setFormData] = useState({
    id: "",
    cantidad: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`http://localhost:8000/api/stock/${formData.id}/restock/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cantidad: Number.parseInt(formData.cantidad),
        }),
      })

      if (response.ok) {
        alert("Producto reabastecido exitosamente")
        setFormData({ id: "", cantidad: "" })
        onProductUpdated()
      } else {
        throw new Error("Error al reabastecer producto")
      }
    } catch (error) {
      alert("No se pudo reabastecer el producto")
      console.error(error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>📦 Reabastecer Producto</h3>
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
            <label htmlFor="restock-cantidad">Cantidad a Agregar</label>
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

          <button type="submit" className="btn btn-success full-width">
            📦 Reabastecer Producto
          </button>
        </form>
      </div>
    </div>
  )
}

// Componente para descontar productos
function SubtractProduct({ onProductUpdated }) {
  const [formData, setFormData] = useState({
    id: "",
    cantidad: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`http://localhost:8000/api/stock/${formData.id}/subtract/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cantidad: Number.parseInt(formData.cantidad),
        }),
      })

      if (response.ok) {
        alert("Producto descontado exitosamente")
        setFormData({ id: "", cantidad: "" })
        onProductUpdated()
      } else {
        throw new Error("Error al descontar producto")
      }
    } catch (error) {
      alert("No se pudo descontar el producto")
      console.error(error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>➖ Descontar Producto</h3>
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
            <label htmlFor="subtract-cantidad">Cantidad a Descontar</label>
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

          <button type="submit" className="btn btn-danger full-width">
            ➖ Descontar Producto
          </button>
        </form>
      </div>
    </div>
  )
}

// Componente para mostrar movimientos
function MovementHistory({ movements }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>📋 Historial de Movimientos</h3>
        <p>Registro de entradas y salidas de productos</p>
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
                  <th>ID Producto</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement, index) => (
                  <tr key={movement.id || index} className={`movement-row ${movement.tipo}`}>
                    <td>
                      <span className={`badge ${movement.tipo === "entrada" ? "badge-success" : "badge-danger"}`}>
                        {movement.tipo === "entrada" ? "Entrada" : "Salida"}
                      </span>
                    </td>
                    <td className="product-id">{movement.producto_id || "N/A"}</td>
                    <td className="product-name">{movement.nombre || "N/A"}</td>
                    <td>{movement.descripcion || "N/A"}</td>
                    <td>${Number(movement.precio || 0).toFixed(2)}</td>
                    <td>{movement.cantidad || 0}</td>
                    <td>📅 {movement.fecha || "N/A"}</td>
                    <td>🕐 {movement.hora || "N/A"}</td>
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

// Componente de pestañas
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
          className={`tab-button ${activeTab === "restock" ? "active" : ""}`}
          onClick={() => setActiveTab("restock")}
        >
          Reabastecer
        </button>
        <button
          className={`tab-button ${activeTab === "subtract" ? "active" : ""}`}
          onClick={() => setActiveTab("subtract")}
        >
          Descontar
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

  // Función para cargar productos
  const loadProducts = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/stock/")
      if (response.ok) {
        const data = await response.json()
        // Convertir precio y cantidad a números
        const processedData = data
          .map((product) => ({
            ...product,
            precio: Number(product.precio) || 0,
            cantidad: Number(product.cantidad) || 0,
          }))
          .reverse() // Agregar esta línea para mostrar los últimos primero
        setProducts(processedData)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  // Función para cargar movimientos (real)
  const loadMovements = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/movimientos/")
      if (response.ok) {
        const data = await response.json()
        console.log("Datos de movimientos recibidos:", data) // Para debug

        // Procesar los datos para asegurar que tengan el formato correcto
        const processedMovements = data
          .map((movement) => {
            console.log("Procesando movimiento:", movement) // Para debug
            return {
              id: movement.id || movement.movimiento_id || "N/A",
              producto_id: movement.producto_id || movement.product_id || movement.id_producto || "N/A",
              nombre: movement.nombre || movement.product_name || movement.producto_nombre || "N/A",
              descripcion: movement.descripcion || movement.description || movement.producto_descripcion || "N/A",
              precio: Number(movement.precio || movement.price || movement.producto_precio || 0),
              cantidad: Number(movement.cantidad || movement.quantity || movement.qty || 0),
              tipo: movement.tipo || movement.type || movement.movement_type || "entrada",
              fecha: movement.fecha || movement.date || movement.created_date || "N/A",
              hora: movement.hora || movement.time || movement.created_time || "N/A",
            }
          })
          // Ordenar por fecha y hora más recientes primero
          .sort((a, b) => {
            // Crear objetos Date para comparar
            const dateA = new Date(`${a.fecha} ${a.hora}`)
            const dateB = new Date(`${b.fecha} ${b.hora}`)
            return dateB - dateA // Orden descendente (más reciente primero)
          })

        console.log("Movimientos procesados:", processedMovements) // Para debug
        setMovements(processedMovements)
      } else {
        console.error("Error al cargar movimientos:", response.status)
      }
    } catch (error) {
      console.error("Error loading movements:", error)
      // En caso de error, mantener un array vacío
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">📦</div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={onLogout} />

      <div className="main-content">
        <header className="dashboard-header">
          <h1>{activeSection === "stock" ? "Gestión de Stock" : "Mi Cuenta"}</h1>
        </header>

        <main className="dashboard-main">
          {activeSection === "stock" && (
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab}>
              {activeTab === "products" && <ProductList products={products} onRefresh={refreshData} />}
              {activeTab === "add" && <AddProduct onProductAdded={refreshData} />}
              {activeTab === "restock" && <RestockProduct onProductUpdated={refreshData} />}
              {activeTab === "subtract" && <SubtractProduct onProductUpdated={refreshData} />}
              {activeTab === "movements" && <MovementHistory movements={movements} />}
            </Tabs>
          )}

          {activeSection === "account" && (
            <div className="card">
              <div className="card-header">
                <h3>Mi Cuenta</h3>
                <p>Información de la cuenta de usuario</p>
              </div>
              <div className="card-content">
                <p>Aquí puedes gestionar la información de tu cuenta.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
