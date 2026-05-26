// API base URL. Empty string = same origin as the page (works when Express serves the build).
// For separate-origin deployments set REACT_APP_BACKEND_URL to the server's public URL.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? ''

export { BACKEND_URL }
