import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../Login/Login.css';
import '../Auth/Auth.css';
import baseURL from '../../url';

// Paso 2: se llega desde el enlace del correo (/restablecer?token=...).
export default function RestablecerContrasena() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (password.length < 8) {
            setErrorMessage('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (password !== confirmacion) {
            setErrorMessage('Las contraseñas no coinciden');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('token', token);
            formData.append('contrasena', password);

            const response = await fetch(`${baseURL}/auth/restablecerPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.mensaje) {
                toast.success(data.mensaje);
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 1800);
            } else {
                setErrorMessage(data.error || 'No se recibió una respuesta válida del servidor');
            }
        } catch (error) {
            console.error('Error:', error.message);
            setErrorMessage('Ocurrió un error al cambiar la contraseña');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='AuthContainer'>
            <div className="formContain">
                <ToastContainer position="top-right" autoClose={2000} />

                <div className="loginCard">
                    <div className="loginHeader">
                        <span className="loginBadge">Panel administrativo</span>
                        <h2>Nueva contraseña</h2>
                        <p>Elegí una contraseña nueva de al menos 8 caracteres.</p>
                    </div>

                    {!token ? (
                        <div className="formAuth">
                            <div className="errorBox">El enlace no es válido. Pedí uno nuevo.</div>
                            <Link to="/recuperar" className="authLink">Pedir un enlace nuevo</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="formAuth" noValidate>
                            <div className="inputsAuth">
                                <label htmlFor="password">Contraseña nueva</label>

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
                                        placeholder="Mínimo 8 caracteres"
                                        autoComplete="new-password"
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

                            <div className="inputsAuth">
                                <label htmlFor="confirmacion">Repetí la contraseña</label>

                                <div className="deFlexInputs">
                                    <span className="inputIcon">
                                        <FontAwesomeIcon icon={faLock} />
                                    </span>

                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmacion"
                                        name="confirmacion"
                                        value={confirmacion}
                                        onChange={(e) => setConfirmacion(e.target.value)}
                                        required
                                        placeholder="Repetí la contraseña"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="errorBox">
                                    {errorMessage}
                                    {errorMessage.includes('Pedí uno nuevo') && (
                                        <> <Link to="/recuperar">Pedir enlace</Link></>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn"
                                disabled={!password || !confirmacion || isSubmitting}
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
