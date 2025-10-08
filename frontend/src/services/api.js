import axios from "axios";

const API_BASE = "http://127.0.0.1:8000"; // SIN /api al final

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Bearer en cada request
api.interceptors.request.use((config) => {
  const access = localStorage.getItem("token");
  if (access) config.headers.Authorization = `Bearer ${access}`; // ✅ Agregados backticks
  return config;
});

let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const code =
      error.response?.data?.code || error.response?.data?.detail?.code;

    const tokenProblem =
      status === 401 &&
      (code === "token_not_valid" ||
        code === "user_inactive" ||
        code === "authentication_failed");

    if (tokenProblem && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
        localStorage.removeItem("token");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then((newAccess) => {
            original.headers.Authorization = `Bearer ${newAccess}`; // ✅ Agregados backticks
            return api.request(original);
          })
          .catch(Promise.reject);
      }

      isRefreshing = true;
      try {
        const r = await axios.post(`${API_BASE}/api/auth/refresh/`, { refresh }); // ✅ Agregados backticks
        const newAccess = r.data.access;
        localStorage.setItem("token", newAccess);
        queue.forEach((p) => p.resolve(newAccess));
        queue = [];
        isRefreshing = false;
        original.headers.Authorization = `Bearer ${newAccess}`; // ✅ Agregados backticks
        return api.request(original);
      } catch (e) {
        queue.forEach((p) => p.reject(e));
        queue = [];
        isRefreshing = false;
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;