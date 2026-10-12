import React from 'react'
import './Main.css'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import ProductosMain from '../../Components/Admin/ProductosMain/ProductosMain'
import UsuariosMain from '../../Components/Admin/UsuariosMain/UsuariosMain'
import CardsCantidad from '../../Components/Admin/CardsCantidad/CardsCantidad'
import InfoUserMain from '../../Components/Admin/InfoUserMain/InfoUserMain'
import AlertaStockBajo from '../../Components/Admin/AlertaStockBajo/AlertaStockBajo'
import { useAuth } from '../../Context/AuthContext'

export default function Main() {
    const { usuario } = useAuth();
    const esAdmin = usuario?.rol === 'admin';

    return (
        <div className='containerGrid'>
            <Header />

            <section className='dashboardMain'>
                <HeaderDash />

                <div className='dashboardMain__content'>
                    <AlertaStockBajo />

                    {esAdmin && (
                        <div className='dashboardMain__row dashboardMain__row--top'>
                            <CardsCantidad />
                            <UsuariosMain />
                        </div>
                    )}

                    <div className='dashboardMain__row dashboardMain__row--bottom'>
                        <ProductosMain />
                        <InfoUserMain />
                    </div>
                </div>
            </section>
        </div>
    )
}
