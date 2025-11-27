import api from "./api";

const normalizeMovement = (movement) => ({
  id: movement.id || movement.movimiento_id || "N/A",
  producto_id: movement.producto_id || movement.product_id || movement.id_producto || "N/A",
  nombre: movement.nombre || movement.product_name || movement.producto_nombre || "N/A",
  descripcion: movement.descripcion || movement.description || movement.producto_descripcion || "N/A",
  precio: Number(movement.precio || movement.price || movement.producto_precio || 0),
  cantidad: Number(movement.cantidad || movement.quantity || movement.qty || 0),
  tipo: movement.tipo || movement.type || movement.movement_type || "entrada",
  fecha: movement.fecha || movement.date || movement.created_date || "N/A",
  hora: movement.hora || movement.time || movement.created_time || "N/A",
});

export const fetchMovements = async (params = {}) => {
  const { data } = await api.get("/api/movimientos/", { params });
  const items = Array.isArray(data) ? data : data?.results || [];
  const normalized = items
    .map(normalizeMovement)
    .sort((a, b) => {
      const dateA = new Date(`${a.fecha} ${a.hora}`);
      const dateB = new Date(`${b.fecha} ${b.hora}`);
      return dateB - dateA;
    });
  const meta = {
    count: data?.count ?? normalized.length,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  };
  return { items: normalized, meta };
};

export default {
  fetchMovements,
};
