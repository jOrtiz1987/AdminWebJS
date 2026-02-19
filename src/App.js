import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import EdificiosHistoricos from './components/EdificiosHistoricos';
import Usuarios from './components/Usuarios';
import Inicio from './components/Inicio';
import Periodos from './components/PeriodoVacacional';
import Visitas from './components/Visitas';
import Categorias from './components/Categorias';
import RegistroCoordenadas from './components/RegistroCoordenadas';

function App() {
  return (
    <Router>
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
            </ul>
          </div>
        </div>
      </nav>
      <div className="main-content">
        <Routes>
          <Route path="/" exact Component={Inicio} />
          <Route path="/categorias" Component={Categorias} />
          <Route path="/edificios-historicos" Component={EdificiosHistoricos} />
          <Route path="/usuarios" Component={Usuarios} />
          <Route path="/periodos" Component={Periodos} />
          <Route path="/visitas" Component={Visitas} />
          <Route path="/registroCoordenadas" Component={RegistroCoordenadas} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
