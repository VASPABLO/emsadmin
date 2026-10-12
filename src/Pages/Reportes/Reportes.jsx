import React from 'react'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import PanelGanancias from '../../Components/Admin/PanelGanancias/PanelGanancias'
import PanelStockBajo from '../../Components/Admin/PanelStockBajo/PanelStockBajo'
import './Reportes.css'

export default function Reportes() {
    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>
                <HeaderDash />
                <div className='container'>
                    <h2 className='reportesTitulo'>Reportes</h2>
                    <p className='reportesSubtitulo'>Ganancias de la semana e inventario en su mínimo.</p>

                    <div className='reportesGrid'>
                        <PanelGanancias />
                        <PanelStockBajo />
                    </div>
                </div>
            </section>
        </div>
    )
}
