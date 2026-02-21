import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import EdificiosHistoricos from './components/EdificiosHistoricos';
import Usuarios from './components/Usuarios';
import Inicio from './components/Inicio';
import Periodos from './components/PeriodoVacacional';
import Visitas from './components/Visitas';
import Categorias from './components/Categorias';
import RegistroCoordenadas from './components/RegistroCoordenadas';
import Login from './components/Login';
import DataScience from './components/DataScience';

// Componente Wrapper para proteger rutas que requieren autenticación
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('jwtToken');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const token = localStorage.getItem('jwtToken');

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login';
  };

  return (
    <Router>
      {/* Mostrar la barra de navegación solo si el usuario está autenticado */}
      {token && (
        <nav className="navbar navbar-expand-lg navbar-custom">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">
              <i className="bi bi-map-fill me-2"></i>
              Turismo Zacatecas
            </Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/categorias">Categorías</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/edificios-historicos">Edificios</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/usuarios">Usuarios</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/periodos">Periodos</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/visitas">Visitas</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/registroCoordenadas">Mapa</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/data-science">Ciencia de Datos</Link>
                </li>
                <li className="nav-item ms-lg-3 d-flex align-items-center mt-2 mt-lg-0">
                  <button onClick={handleLogout} className="btn btn-outline-light btn-sm shadow-sm rounded-pill px-3">
                    <i className="bi bi-box-arrow-right me-2"></i>Salir
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Inicio /></PrivateRoute>} />
          <Route path="/categorias" element={<PrivateRoute><Categorias /></PrivateRoute>} />
          <Route path="/edificios-historicos" element={<PrivateRoute><EdificiosHistoricos /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/periodos" element={<PrivateRoute><Periodos /></PrivateRoute>} />
          <Route path="/visitas" element={<PrivateRoute><Visitas /></PrivateRoute>} />
          <Route path="/registroCoordenadas" element={<PrivateRoute><RegistroCoordenadas /></PrivateRoute>} />
          <Route path="/data-science" element={<PrivateRoute><DataScience /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
