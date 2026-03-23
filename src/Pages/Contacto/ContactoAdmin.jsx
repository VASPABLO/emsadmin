import React from 'react';
import Header from '../Header/Header';
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash';
import ContactoData from '../../Components/Admin/ContactoData/ContactoData';

export default function ContactoAdmin() {
    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>
                <HeaderDash />

                <div className='container'>
                    <ContactoData />
                </div>
            </section>
        </div>
    );
}
