// Igual que fetch, pero manda la cookie de sesión por default.
// El backend ahora exige sesión (requireRole) en casi todos los endpoints del panel admin,
// así que cualquier llamada que no mande la cookie recibe 401 aunque el usuario esté logueado.
export default function apiFetch(url, options = {}) {
    return fetch(url, { credentials: 'include', ...options });
}
