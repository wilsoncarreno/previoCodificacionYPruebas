const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.REACT_APP_API_URL || process.env.API_BASE_URL)) ||
  "http://127.0.0.1:8000"

const env = { API_BASE }

export default env
export { API_BASE, env }
