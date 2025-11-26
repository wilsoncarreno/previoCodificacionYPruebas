import api from "./api";

const normalizeProduct = (product) => ({
  ...product,
  precio: Number(product.precio) || 0,
  cantidad: Number(product.cantidad) || 0,
});

export const fetchProducts = async () => {
  const { data } = await api.get("/api/stock/");
  const items = Array.isArray(data) ? data : data?.results || [];
  return items.map(normalizeProduct).reverse();
};

export const addProduct = async ({ id, nombre, descripcion, precio, cantidad }) => {
  const payload = {
    id,
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
