import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Spiner from '../Spiner/Spiner';
import baseURL from '../../url';

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const validateSession = async () => {
            setLoading(true);

            try {
                let data = null;

                for (const endpoint of [
                    new URL('userLogued.php', `${baseURL}/`).toString(),
                    new URL('public/userLogued.php', `${baseURL}/`).toString(),
                    new URL('build/userLogued.php', `${baseURL}/`).toString(),
                ]) {
                    const response = await fetch(endpoint, {
                        credentials: 'include',
                        cache: 'no-store',
                    });

                    if (!response.ok) {
                        continue;
                    }

                    const contentType = response.headers.get('content-type') || '';
                    if (!contentType.includes('application/json')) {
                        continue;
                    }

                    data = await response.json();
                    break;
                }

                if (!isMounted) {
                    return;
                }

                setIsAuthenticated(Boolean(data && data.idUsuario));
            } catch (error) {
                if (isMounted) {
                    setIsAuthenticated(false);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        validateSession();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return <Spiner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
