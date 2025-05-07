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

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <Link className="navbar-brand" to="/">Turismo de Zacatecas</Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
          <li className="nav-item">
              <Link className="nav-link" to="/categorias">Categorias</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/edificios-historicos">Edificios Historicos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/usuarios">Usuarios</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/periodos">Periodos Vacacionales</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/visitas">Visitas</Link>
            </li>
          </ul>
        </div>
      </nav>
      <Routes>
          <Route path="/" exact Component={Inicio} />
          <Route path="/categorias" Component={Categorias} />
          <Route path="/edificios-historicos" Component={EdificiosHistoricos} />
          <Route path="/usuarios" Component={Usuarios} />
          <Route path="/periodos" Component={Periodos} />
          <Route path="/visitas" Component={Visitas} />
        </Routes>
      </Router>
  );
}

export default App;
