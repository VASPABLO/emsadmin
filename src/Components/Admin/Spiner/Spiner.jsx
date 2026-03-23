import React from 'react';
import logo from '../../../images/logo.png';
import './Spiner.css';

export default function Spiner() {
    return (
        <div className="spinnerContainer">
            <div className="spinnerCard">
                <div className="logoWrapper">
                    <span className="spinnerRing"></span>
                    <img
                        src={logo}
                        alt="Cargando"
                        className="spinnerImage"
                    />
                </div>

                <p className="spinnerText">Cargando</p>
            </div>
        </div>
    );
}