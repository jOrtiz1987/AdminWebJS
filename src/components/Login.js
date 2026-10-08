import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ correo: '', password: '' });
    const [errorText, setErrorText] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
            if (response.data && response.data.jwt) {
                localStorage.setItem('jwtToken', response.data.jwt);
                navigate('/');
                // Recargar la aplicación para que App.js detecte el token y actualice el navbar
                window.location.reload();
            } else {
                setErrorText('No se recibió token. Contacte al administrador.');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setErrorText('Credenciales incorrectas. Verifique su usuario y contraseña.');
            } else {
                setErrorText('Error al intentar iniciar sesión. Inténtelo más tarde.');
            }
        }
    };

    return (
        <div className="container mt-5 fade-in-tab">
            <div className="row justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                <div className="col-12 col-sm-10 col-md-7 col-lg-5">
                    <div className="card-modern border-0 p-4 shadow-lg">
                        <div className="text-center mb-4">
                            <div className="metric-icon-container bg-gradient-blue mx-auto mb-3" style={{ width: '70px', height: '70px', fontSize: '2rem' }}>
                                <i className="bi bi-shield-lock-fill"></i>
                            </div>
                            <h3 className="fw-bold text-dark m-0">Iniciar Sesión</h3>
                            <p className="text-secondary small mt-1">Ingrese sus credenciales de administrador</p>
                        </div>

                        {errorText && (
                            <div className="alert alert-danger d-flex align-items-center shadow-sm border-0 mb-4" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <div className="small fw-semibold">{errorText}</div>
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary small">Usuario / Correo</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-secondary"></i></span>
                                    <input
                                        type="email"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="correo@ejemplo.com"
                                        value={credentials.correo}
                                        onChange={(e) => setCredentials({ ...credentials, correo: e.target.value })}
                                        required
                                        style={{ outline: 'none', boxShadow: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold text-secondary small">Contraseña</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-secondary"></i></span>
                                    <input
                                        type="password"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        required
                                        style={{ outline: 'none', boxShadow: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="d-grid">
                                <button type="submit" className="btn btn-primary btn-lg rounded-pill shadow-sm py-2.5 fw-semibold">
                                    Ingresar al Sistema <i className="bi bi-box-arrow-in-right ms-2"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
