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

export default Tabs
