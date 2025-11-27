import api from "./api";

const normalizeProduct = (product) => ({
  ...product,
  precio: Number(product.precio) || 0,
  cantidad: Number(product.cantidad) || 0,
  codigo: product.codigo || "",
});

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get("/api/stock/", { params });
  const items = Array.isArray(data) ? data : data?.results || [];
  const normalized = items.map(normalizeProduct).reverse();
  const meta = {
    count: data?.count ?? normalized.length,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  };
  return { items: normalized, meta };
};

export const addProduct = async ({ codigo, nombre, descripcion, precio, cantidad }) => {
  const payload = {
    codigo,
    nombre,
    descripcion,
    precio: Number.parseFloat(precio),
    cantidad: Number.parseInt(cantidad),
  };
  return api.post("/api/stock/", payload);
};

export const restockProduct = async ({ id, cantidad }) => {
  const payload = { cantidad: Number.parseInt(cantidad) };
  return api.put(`/api/stock/${id}/restock/`, payload);
};

export const subtractProduct = async ({ id, cantidad }) => {
  const payload = { cantidad: Number.parseInt(cantidad) };
  return api.put(`/api/stock/${id}/subtract/`, payload);
};

export const updateProduct = async ({ id, nombre, descripcion, precio, cantidad }) => {
  const payload = {
    ...(nombre !== undefined ? { nombre } : {}),
    ...(descripcion !== undefined ? { descripcion } : {}),
    ...(precio !== undefined ? { precio: Number.parseFloat(precio) } : {}),
    ...(cantidad !== undefined ? { cantidad: Number.parseInt(cantidad) } : {}),
  };
  return api.patch(`/api/stock/${id}/`, payload);
};

export const deleteProduct = async (id) => {
  return api.delete(`/api/stock/${id}/`);
};

export default {
  fetchProducts,
  addProduct,
  restockProduct,
  subtractProduct,
  updateProduct,
  deleteProduct,
};
