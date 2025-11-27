import api from "./api";
import { fetchMovements } from "./movementService";

jest.mock("./api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe("movementService", () => {
  beforeEach(() => jest.clearAllMocks());

  test("fetchMovements devuelve items ordenados y meta", async () => {
    api.get.mockResolvedValue({
      data: {
        count: 2,
        results: [
          { id: 1, fecha: "2025-01-01", hora: "10:00:00", tipo: "salida" },
          { id: 2, fecha: "2025-02-01", hora: "09:00:00", tipo: "entrada" },
        ],
      },
    });

    const { items, meta } = await fetchMovements();

    expect(api.get).toHaveBeenCalledWith("/api/movimientos/", { params: {} });
    expect(meta).toEqual({ count: 2, next: null, previous: null });
    expect(items[0].id).toBe(2); // mas reciente primero
    expect(items[1].id).toBe(1);
  });
});
