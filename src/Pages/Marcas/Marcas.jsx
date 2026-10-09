import React from 'react'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import MarcasData from '../../Components/Admin/MarcasData/MarcasData'

export default function Marcas() {
    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>
                <HeaderDash />
                <div className='container'>
                    <MarcasData />
                </div>
            </section>
        </div>
    )
}
