import React from 'react'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import DestacadosData from '../../Components/Admin/DestacadosData/DestacadosData'

export default function Destacados() {
    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>
                <HeaderDash />
                <div className='container'>
                    <DestacadosData />
                </div>
            </section>
        </div>
    )
}
