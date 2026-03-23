import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import baseURL from '../../url';

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFormValid = useMemo(() => {
        return email.trim() !== '' && password.trim() !== '';
    }, [email, password]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!email.trim() || !password.trim()) {
            toast.error('Completa el correo y la contraseña');
            return;
        }

        setIsSubmitting(true);

        try {
            // MODO DESARROLLO (comentado)
            // toast.success('Ingreso en modo desarrollo');
            // window.dispatchEvent(new Event('auth:changed'));
            //
            // setTimeout(() => {
            //     navigate('/dashboard', { replace: true });
            // }, 700);

            // MODO PRODUCCION ACTIVO
            const formData = new FormData();
            formData.append('email', email.trim());
            formData.append('contrasena', password);
            formData.append('iniciar_sesion', true);

            let data = null;
            let resolvedEndpoint = '';

            for (const endpoint of [
                new URL('login.php', `${baseURL}/`).toString(),
                new URL('public/login.php', `${baseURL}/`).toString(),
                new URL('build/login.php', `${baseURL}/`).toString(),
            ]) {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });

                if (!response.ok) {
                    continue;
                }

                const contentType = response.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    continue;
                }

                data = await response.json();
                resolvedEndpoint = endpoint;
                break;
            }

            if (!data) {
                throw new Error('No se encontró un endpoint de login válido en producción');
            }

            if (data.mensaje) {
                toast.success(data.mensaje);
                console.log('Login exitoso en:', resolvedEndpoint);
                window.dispatchEvent(new Event('auth:changed'));

                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1200);
            } else if (data.error) {
                setErrorMessage(data.error);
                toast.error(data.error);
            } else {
                toast.error('No se recibió una respuesta válida del servidor');
            }
        } catch (error) {
            console.error('Error:', error.message);
            setErrorMessage(error.message);
            toast.error(error.message || 'Ocurrió un error al iniciar sesión');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="formContain">
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="loginCard">
                <div className="loginHeader">
                    <span className="loginBadge">Panel administrativo</span>
                    <h2>Iniciar sesión</h2>
                    <p>
                        Accede al panel de administración con tus credenciales.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="formAuth" noValidate>
                    <div className="inputsAuth">
                        <label htmlFor="email">Correo electrónico</label>

                        <div className="inputWrap">
                            <span className="inputIcon">
                                <FontAwesomeIcon icon={faEnvelope} />
                            </span>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@correo.com"
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="inputsAuth">
                        <label htmlFor="password">Contraseña</label>

                        <div className="deFlexInputs">
                            <span className="inputIcon">
                                <FontAwesomeIcon icon={faLock} />
                            </span>

                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Ingresa tu contraseña"
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="togglePasswordBtn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="errorBox">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn"
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
                    </button>
                  
                </form>
            </div>
        </div>
    );
}