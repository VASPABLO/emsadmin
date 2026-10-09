import React from 'react'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import CatalogoVendedor from '../../Components/Admin/CatalogoVendedor/CatalogoVendedor'

export default function NuevoPedido() {
    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>
                <HeaderDash />
                <div className='container'>
                    <CatalogoVendedor />
                </div>
            </section>
        </div>
    )
}
