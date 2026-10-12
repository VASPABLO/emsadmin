import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';

export default function RequireRole({ roles, children }) {
    const { usuario } = useAuth();

    if (!usuario || !roles.includes(usuario.rol)) {
        return <Navigate to='/dashboard' replace />;
    }

    return children;
}
