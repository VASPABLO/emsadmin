// URL base del backend, SIN barra final (todas las llamadas son `${baseURL}/carpeta/archivo.php`).
//
// El valor viene de REACT_APP_API_URL, que Create React App toma del archivo
// de entorno correspondiente:
//
//   npm start      -> .env.development  (backend local de Laragon)
//   npm run build  -> .env.production   (https://emscrsoluciones.com)
//
// Para sobreescribirlo solo en tu máquina, sin tocar git, usá .env.development.local.
// Nota: en producción emsadmin sirve el sitio público, el login y el panel admin
// desde el dominio principal, con el backend en la misma raíz.
const baseURL = (process.env.REACT_APP_API_URL || 'https://emscrsoluciones.com').replace(/\/+$/, '');

// Entorno actual, útil para logs o comportamientos solo de desarrollo.
export const isDev = process.env.NODE_ENV === 'development';

export default baseURL;
