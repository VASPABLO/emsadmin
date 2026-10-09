// emsadmin es el panel admin, servido desde admin.emscrsoluciones.com, con su
// propio backend ahí mismo (ver backend/.env -> RUTA_WEB).
const baseURL = process.env.REACT_APP_API_URL || 'https://admin.emscrsoluciones.com/';

export default baseURL;
