# CLAUDE.md

Panel admin + sitio público de EMS CR Soluciones. React (CRA) en `src/`, backend PHP 8.1+
y MySQL en `backend/`. Ver `README.md` para entornos y puesta en marcha local.

Responder siempre en español, explicando en lenguaje simple.

## Producción / despliegue

- Dominio: https://emscrsoluciones.com (Hostinger, hosting compartido).
- SSH: `ssh -i ~/.ssh/emsadmin_deploy -p 65002 u806400198@157.173.209.105`
  - Llave exclusiva de este proyecto: `~/.ssh/emsadmin_deploy` (etiqueta `github-emsadmin`),
    registrada en hPanel → Acceso SSH. No usar `~/.ssh/micita_deploy` (es de otro proyecto).
- Carpeta del sitio: `~/domains/emscrsoluciones.com/public_html` (no es un repo git).
  Ahí conviven el contenido de `build/` y el de `backend/`.
- El servidor tiene git, composer, rsync y PHP 8.2, pero **no Node**: el build se hace
  en GitHub Actions.
- Deploy automático: push a `master` → `.github/workflows/deploy.yml`
  (npm build + composer install + rsync sin `--delete`).
- Secrets de GitHub Actions: `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY`,
  `SSH_KNOWN_HOSTS`, `DEPLOY_PATH`.

### Cosas del servidor que el deploy nunca debe tocar

- `public_html/.env` y `.env.backup`: credenciales de BD y correo de producción
  (fuera del repo; solo se editan en el servidor).
- `public_html/imagenes_productos/`: imágenes subidas desde el panel.
- `public_html/admin/imagenes_*`: imágenes antiguas; las URLs guardadas en la BD apuntan ahí.
- La base de datos de producción: el deploy no corre migraciones. Pedir confirmación
  antes de cualquier cambio en ella.
