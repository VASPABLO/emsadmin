// Proxy opcional del servidor de desarrollo de Create React App.
//
// Solo se activa si existe la variable DEV_API_TARGET (la usa el script
// "npm run start:prod-api"). En ese caso, el navegador llama a /api/... sobre
// http://localhost:3000 —o sea, al mismo origen— y el dev server reenvía la
// llamada al backend indicado.
//
// Esto hace falta porque la cookie de sesión de PHP (PHPSESSID) sale sin el
// atributo SameSite, así que el navegador la trata como Lax y no la manda en
// llamadas cross-site. Sin proxy, un "npm start" apuntando al dominio de
// producción logra loguearse pero pierde la sesión en la llamada siguiente, y
// el panel rebota al sitio público. Pasando por el proxy la cookie es de
// primera parte y la sesión se mantiene.
//
// "npm start" (backend local de Laragon) no usa proxy: localhost:3000 y
// localhost:8081 son el mismo site, la cookie viaja igual y el CORS del
// backend ya acepta cualquier puerto de localhost en entorno local.

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    const target = process.env.DEV_API_TARGET;

    if (!target) {
        return;
    }

    console.log(`[setupProxy] /api -> ${target}`);

    app.use(
        '/api',
        createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: { '^/api': '' },
            // La cookie del backend llega sin dominio propio, así que el
            // navegador la guarda para localhost. Nada que reescribir.
            cookieDomainRewrite: '',
            logLevel: 'warn',
        })
    );
};
