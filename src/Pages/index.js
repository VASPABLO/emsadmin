import MainLayout from "../Layouts/MainLayout";
import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Productos from '../Pages/Productos/Productos'
import Usuarios from '../Pages/Usuarios/Usuarios'
import Banners from "./Banners/Banners";
import Main from "./Main/Main";
import Contacto from "./Contacto/Contacto";
import Categorias from "./Categorias/Categorias";
import Codigos from "./Codigos/Codigos";
import PageDetail from '../Pages/PageDetail/PageDetail';
import PageProductos from "./PageProductos/PageProductos";
import Pedidos from "./Pedidos/Pedidos";
import Home from "./Home/Home";
import SobreNosotros from "./Nosotros/Nosotros";
import Destacados from "./Destacados/Destacados";
import Servicios from "./Servicios/Servicios";
import ContactoPublico from "./Contacto/Contacto";
import Demo from "../Pages/Demo/Demo";
import Login from "../Components/Admin/Login/Login";
import ProtectedRoute from "../Components/Admin/ProtectedRoute/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/home",
        element: <ProtectedRoute><Home /></ProtectedRoute>,
    },
    {
        path: "/nosotros",
        element: <ProtectedRoute><SobreNosotros /></ProtectedRoute>,
    },
    {
        path: "/servicios",
        element: <ProtectedRoute><Servicios /></ProtectedRoute>,
    },
    {
        path: "/contacto",
        element: <ProtectedRoute><ContactoPublico /></ProtectedRoute>,
    },
    {
        path: "/catalogo",
        element: <ProtectedRoute><Demo /></ProtectedRoute>,
    },
    {
        path: "/producto/:idProducto/:producto",
        element: <ProtectedRoute><PageDetail /></ProtectedRoute>,
    },
    {
        path: "/productos",
        element: <ProtectedRoute><PageProductos /></ProtectedRoute>,
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
                path: `productos`,
                element: <Productos />,
            },
            {
                path: `usuarios`,
                element: <Usuarios />,
            },
            {
                path: `banners`,
                element: <Banners />,
            },
            {
                path: `contacto`,
                element: <Contacto />,
            },
            {
                path: `categorias`,
                element: <Categorias />,
            },
            {
                path: `codigos`,
                element: <Codigos />,
            },
            {
                path: `pedidos`,
                element: <Pedidos />,
            },
                        {
                path: `destacados`,
                element: <Destacados />,
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
]);
