import React from 'react';
import './HeaderDash.css';
import ButonScreen from '../ButonScreen/ButonScreen';
import InputSearch from '../InputSearch/InputSearch';
import InfoUser from '../InfoUser/InfoUser';
import ButonInstallAppNav from '../ButonInstallAppNav/ButonInstallAppNav';
import { Link as Anchor } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

export default function HeaderDash() {
    return (
        <div className='HeaderDashContain'>
            <InputSearch />

            <div className='deFlexHeader'>
                <ButonScreen />
                <ButonInstallAppNav />
                <Anchor to='/home' className='homeSessionBtn'>
                    <div className='homeSessionAvatar'>
                        <FontAwesomeIcon icon={faHome} />
                    </div>

                    <div className='homeSessionText'>
                        <span>Navegacion</span>
                        <strong>Inicio</strong>
                    </div>
                </Anchor>
                <InfoUser />
            </div>
        </div>
    );
}
