import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import '../Login/Login.css';
import '../Auth/Auth.css';
import baseURL from '../../url';

// Paso 1: el usuario escribe su correo y el backend le manda el enlace.
export default function RecuperarContrasena() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enviado, setEnviado] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Ingresá tu correo');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('email', email.trim());

            const response = await fetch(`${baseURL}/auth/recuperarPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.mensaje) {
                setEnviado(data.mensaje);
            } else {
                toast.error(data.error || 'No se recibió una respuesta válida del servidor');
            }
        } catch (error) {
            console.error('Error:', error.message);
            toast.error('Ocurrió un error al enviar la solicitud');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='AuthContainer'>
            <div className="formContain">
                <ToastContainer position="top-right" autoClose={2500} />

                <div className="loginCard">
                    <div className="loginHeader">
                        <span className="loginBadge">Panel administrativo</span>
                        <h2>Recuperar contraseña</h2>
                        <p>
                            Escribí el correo con el que ingresás y te enviaremos un enlace para elegir una contraseña nueva.
                        </p>
                    </div>

                    {enviado ? (
                        <div className="formAuth">
                            <div className="successBox">{enviado}</div>
                            <Link to="/login" className="authLink">Volver a iniciar sesión</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="formAuth" noValidate>
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

                            <button
                                type="submit"
                                className="btn"
                                disabled={!email.trim() || isSubmitting}
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
                            </button>

                            <Link to="/login" className="authLink">Volver a iniciar sesión</Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
