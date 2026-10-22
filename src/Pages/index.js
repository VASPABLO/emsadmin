import IndexLayout from "../Layouts/IndexLayout";
import PagesLayaut from '../Layouts/PagesLayaut';
import MainLayout from '../Layouts/MainLayout';
import { createBrowserRouter, Navigate } from "react-router-dom";
import PageDetail from '../Pages/PageDetail/PageDetail';
import PageProductos from "./PageProductos/PageProductos";
import Home from "./Home/Home";
import Nosotros from "./Nosotros/Nosotros";
import Servicios from "./Servicios/Servicios";
import Contacto from "./Contacto/Contacto";
import Auth from "../Components/Admin/Auth/Auth";
import RecuperarContrasena from "../Components/Admin/RecuperarContrasena/RecuperarContrasena";
import RestablecerContrasena from "../Components/Admin/RestablecerContrasena/RestablecerContrasena";
import Main from "./Main/Main";
import Productos from "./Productos/Productos";
import Pedidos from "./Pedidos/Pedidos";
import Categorias from "./Categorias/Categorias";
import Banners from "./Banners/Banners";
import Destacados from "./Destacados/Destacados";
import ContactoAdmin from "./Contacto/ContactoAdmin";
import Usuarios from "./Usuarios/Usuarios";
import Codigos from "./Codigos/Codigos";
import NuevoPedido from "./NuevoPedido/NuevoPedido";
import Reportes from "./Reportes/Reportes";
import Marcas from "./Marcas/Marcas";
import RequireRole from "../Components/Admin/RequireRole/RequireRole";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/inicio",
        element: <Home />,
    },
    {
        path: "/nosotros",
        element: <Nosotros />,
    },
    {
        path: "/servicios",
        element: <Servicios />,
    },
    {
        path: "/catalogo",
        element: <IndexLayout />,
    },
    {
        path: "/contacto",
        element: <Contacto />,
    },
    {
        path: "/login",
        element: <Auth />,
    },
    {
        path: "/recuperar",
        element: <RecuperarContrasena />,
    },
    {
        path: "/restablecer",
        element: <RestablecerContrasena />,
    },
    {
        path: "/dashboard",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Main />,
            },
            {
                path: "productos",
                element: <RequireRole roles={['admin']}><Productos /></RequireRole>,
            },
            {
                path: "nuevo-pedido",
                element: <RequireRole roles={['vendedor', 'admin']}><NuevoPedido /></RequireRole>,
            },
            {
                path: "pedidos",
                element: <RequireRole roles={['cajera', 'admin']}><Pedidos /></RequireRole>,
            },
            {
                path: "categorias",
                element: <RequireRole roles={['admin']}><Categorias /></RequireRole>,
            },
            {
                path: "banners",
                element: <RequireRole roles={['admin']}><Banners /></RequireRole>,
            },
            {
                path: "marcas",
                element: <RequireRole roles={['admin']}><Marcas /></RequireRole>,
            },
            {
                path: "destacados",
                element: <RequireRole roles={['admin']}><Destacados /></RequireRole>,
            },
            {
                path: "contacto",
                element: <RequireRole roles={['admin']}><ContactoAdmin /></RequireRole>,
            },
            {
                path: "usuarios",
                element: <RequireRole roles={['admin']}><Usuarios /></RequireRole>,
            },
            {
                path: "codigos",
                element: <RequireRole roles={['admin']}><Codigos /></RequireRole>,
            },
            {
                path: "reportes",
                element: <RequireRole roles={['admin']}><Reportes /></RequireRole>,
            },
        ],
    },
    {
        path: "/dasboard",
        element: <Navigate to='/dashboard' replace />,
    },
    {
        path: "/dasboard/*",
        element: <Navigate to='/dashboard' replace />,
    },
    {
        path: "/",
        element: <PagesLayaut />,
        children: [
            {
                path: "producto/:idProducto/:producto",
                element: <PageDetail />,
            },
            {
                path: "productos",
                element: <PageProductos />,
            },
        ]
    },
]);