import api from "./api";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "./stockService";

jest.mock("./api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("stockService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetchProducts devuelve items normalizados y meta", async () => {
    api.get.mockResolvedValue({
      data: {
        count: 2,
        results: [
          { id: 1, precio: "10.00", cantidad: "5" },
          { id: 2, precio: "0", cantidad: null },
        ],
      },
    });

    const { items, meta } = await fetchProducts();
    expect(api.get).toHaveBeenCalledWith("/api/stock/", { params: {} });
    expect(meta).toEqual({ count: 2, next: null, previous: null });
    expect(items).toEqual([
      { id: 2, precio: 0, cantidad: 0 },
      { id: 1, precio: 10, cantidad: 5 },
    ]);
  });

  test("updateProduct envia patch con precio y cantidad", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await updateProduct({ id: 1, precio: 12.5, cantidad: 3 });
    expect(api.patch).toHaveBeenCalledWith("/api/stock/1/", {
      precio: 12.5,
      cantidad: 3,
    });
  });

  test("deleteProduct llama al endpoint correcto", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await deleteProduct(4);
    expect(api.delete).toHaveBeenCalledWith("/api/stock/4/");
  });

  test("addProduct mapea numericos y envia codigo", async () => {
    api.post.mockResolvedValue({ data: {} });
    await addProduct({
      codigo: "SKU-10",
      nombre: "X",
      descripcion: "Y",
      precio: "5.50",
      cantidad: "2",
    });
    expect(api.post).toHaveBeenCalledWith("/api/stock/", {
      codigo: "SKU-10",
      nombre: "X",
      descripcion: "Y",
      precio: 5.5,
      cantidad: 2,
    });
  });
});
