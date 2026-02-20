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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm border-0 rounded-pilled p-4 mt-5">
                        <div className="card-body">
                            <div className="text-center mb-4">
                                <i className="bi bi-person-circle display-4 text-primary"></i>
                                <h3 className="mt-3 fw-bold">Iniciar Sesión</h3>
                                <p className="text-muted">Ingrese sus credenciales para continuar</p>
                            </div>

                            {errorText && (
                                <div className="alert alert-danger d-flex align-items-center" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    <div>{errorText}</div>
                                </div>
                            )}

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Usuario</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-person text-secondary"></i></span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 ps-0"
                                            placeholder="Ingrese su usuario o correo"
                                            value={credentials.correo}
                                            onChange={(e) => setCredentials({ ...credentials, correo: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Contraseña</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-secondary"></i></span>
                                        <input
                                            type="password"
                                            className="form-control border-start-0 ps-0"
                                            placeholder="Ingrese su contraseña"
                                            value={credentials.password}
                                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="d-grid mt-4">
                                    <button type="submit" className="btn btn-primary btn-lg shadow-sm">
                                        Entrar <i className="bi bi-box-arrow-in-right ms-1"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
