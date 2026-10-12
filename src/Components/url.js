// emsadmin sirve todo (sitio público + login + panel admin) desde el dominio
// principal emscrsoluciones.com, con su propio backend ahí mismo (ver
// backend/.env -> RUTA_WEB). admin.emscrsoluciones.com solo se mantiene para
// servir las imágenes ya subidas ahí antes de este cambio.
const baseURL = process.env.REACT_APP_API_URL || 'https://emscrsoluciones.com/';

export default baseURL;
