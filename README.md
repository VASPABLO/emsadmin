# emsadmin

Panel administrativo + sitio público de EMS CR Soluciones.
Frontend en React (Create React App) y backend en PHP + MySQL dentro de `backend/`.

## Entornos (desarrollo y producción en simultáneo)

El mismo código corre en los dos entornos; lo único que cambia son los archivos de
variables de entorno. No hay que editar nada al pasar de uno a otro.

| | Desarrollo (tu PC con Laragon) | Producción (hosting) |
| --- | --- | --- |
| Frontend | `npm start` → lee `.env.development` | `npm run build` → lee `.env.production` |
| URL de la API | `http://localhost:8081/emsadmin/backend` | `https://emscrsoluciones.com` |
| Backend | `backend/.env.local` (prioridad) | `backend/.env` |
| Base de datos | MySQL local de Laragon | MySQL del hosting |

Archivos versionados en git: `.env.development`, `.env.production` y
`backend/.env.example` (plantilla, sin credenciales).
Archivos que **no** se versionan y son propios de cada máquina/servidor:
`backend/.env`, `backend/.env.local`, `.env*.local`.

### Cómo decide el backend en qué entorno está

`backend/config/env.php` carga primero `backend/.env` y después `backend/.env.local`
si existe, así que en tu PC `.env.local` manda y el `.env` de producción se puede
dejar tal cual. Además expone:

- `appEnv()` / `esLocal()`: entorno actual. Se puede forzar con `APP_ENV=local|production`
  en el `.env`; si no está, se detecta por el host (`localhost`, `127.0.0.1`, `*.test`
  → local; cualquier otro → producción).
- `rutaWeb()`: URL pública del backend, sin barra final, usada para armar las rutas
  absolutas de las imágenes que se suben. Toma `RUTA_WEB` del `.env`, y si no está
  definida la deduce del request (esquema + host + carpeta del backend).
- `corsOrigins()`: orígenes permitidos. Los dominios de producción están siempre
  permitidos; en entorno local se acepta además cualquier puerto de
  `localhost`/`127.0.0.1` y cualquier host `.test`, así que el servidor de desarrollo
  de React funciona sin tocar la lista. Se pueden sumar más con `CORS_ORIGINS`.

### Puesta en marcha en desarrollo

1. Levantar Apache y MySQL en Laragon. **Apache escucha en el puerto 8081**
   (`Listen 8081` en `C:\laragon\etc\apache2\httpd.conf`), por eso la URL de la API
   lleva el puerto. Comprobación rápida:
   <http://localhost:8081/emsadmin/backend/auth/userLogued.php> tiene que devolver
   JSON (`{"error":"Usuario no autenticado"}` si no hay sesión).
2. Base de datos local: `emssoluciones_local` (mismas 9 tablas que crea el script de
   setup). Poné en
   `backend/.env.local` el nombre, usuario y contraseña reales de tu MySQL.
3. Crear las tablas: abrir `http://localhost:8081/emsadmin/backend/setup/crearTablas.php`
   una sola vez.
4. `npm install` y `npm start` → <http://localhost:3000> contra el backend local.

El vhost `http://emsadmin.test:8081` **no** sirve la API: su `DocumentRoot` es la
carpeta `public/` del frontend, así que las llamadas al backend tienen que ir por
`http://localhost:8081/emsadmin/backend`.

Los archivos `.env` se leen una sola vez, al arrancar: si cambiás
`.env.development`, hay que reiniciar `npm start` para que tome el valor nuevo.

### Scripts

| Script | Para qué sirve |
| --- | --- |
| `npm start` | Desarrollo contra el backend local. |
| `npm run start:prod-api` | Desarrollo (hot reload) contra la API de **producción**, para reproducir un problema con datos reales. Pasa por el proxy de `src/setupProxy.js` (`/api` → dominio de producción) para que la cookie de sesión no se pierda. Cuidado: escribe en la base de producción. |
| `npm run build` | Build de producción (API `https://emscrsoluciones.com`) en `build/`. |
| `npm run build:dev-api` | Build apuntando al backend local, para probar el bundle compilado. |
| `npm test` | Tests en modo watch. |

### Despliegue a producción

1. `npm run build`.
2. Subir el contenido de `build/` y el contenido de `backend/` a la raíz pública del
   hosting (en producción los endpoints quedan en `/productos/...`, `/auth/...`, etc.).
3. **No** subir `backend/.env.local`: el servidor usa su propio `backend/.env`.
   `backend/.htaccess` bloquea el acceso web a los `.env` y al `composer.json/lock`.

## Create React App

Este proyecto fue creado con [Create React App](https://github.com/facebook/create-react-app).
Documentación completa de los scripts y opciones avanzadas:
<https://facebook.github.io/create-react-app/docs/getting-started>.

### Si el login te devuelve al sitio público

El panel (`/dashboard`) se monta en `src/Layouts/MainLayout.jsx`, que llama a
`auth/userLogued.php` y, si no recibe un usuario con rol válido, hace
`Navigate to '/'`. O sea: **caer en el sitio público significa que esa llamada no
devolvió la sesión**. Las causas habituales, en orden:

1. **La API no responde.** Si `REACT_APP_API_URL` apunta a un puerto o una ruta
   donde no está el backend, el `fetch` falla, el `catch` deja el usuario vacío y
   rebota al home. Abrí la URL de `auth/userLogued.php` en el navegador: si no
   devuelve JSON, el problema es la URL o Apache.
2. **El dev server quedó con el valor viejo.** Reiniciá `npm start` después de
   tocar cualquier `.env`.
3. **Llamadas cross-site.** Si el frontend corre en `localhost:3000` y la API en
   otro dominio (por ejemplo el de producción), la cookie `PHPSESSID` sale sin
   `SameSite=None`, el navegador no la manda y el login "entra" pero la llamada
   siguiente ya no tiene sesión. Para ese caso usá `npm run start:prod-api`, que
   mete el proxy del dev server y hace que la cookie sea de primera parte.
4. **Rol sin acceso al panel.** Solo `admin`, `vendedor` y `cajera` entran al
   dashboard; un usuario con rol `usuario` también termina en el sitio público.
