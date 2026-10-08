import React from 'react';

import { Link } from 'react-router-dom';

function Inicio() {
  const cards = [
    { title: 'Edificios Históricos', path: '/edificios-historicos', icon: 'bi-bank', gradient: 'bg-gradient-blue', desc: 'Gestionar catálogo de monumentos' },
    { title: 'Usuarios', path: '/usuarios', icon: 'bi-people-fill', gradient: 'bg-gradient-purple', desc: 'Administrar acceso y roles' },
    { title: 'Visitas', path: '/visitas', icon: 'bi-geo-alt-fill', gradient: 'bg-gradient-green', desc: 'Registro de actividad turística' },
    { title: 'Categorías', path: '/categorias', icon: 'bi-tags-fill', gradient: 'bg-gradient-blue', desc: 'Clasificación de sitios' },
    { title: 'Periodos', path: '/periodos', icon: 'bi-calendar-range-fill', gradient: 'bg-gradient-purple', desc: 'Temporadas vacacionales' },
    { title: 'Coordenadas', path: '/registroCoordenadas', icon: 'bi-map-fill', gradient: 'bg-gradient-green', desc: 'Ubicaciones geográficas' },
  ];

  return (
    <div className="fade-in-tab">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-dark">Panel de Control General</h1>
        <p className="lead text-secondary">Bienvenido al sistema de administración inteligente de Turismo de Zacatecas.</p>
      </div>

      <div className="row g-4">
        {cards.map((card, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-4">
            <Link to={card.path} style={{ textDecoration: 'none' }}>
              <div className="card-modern h-100 d-flex flex-column align-items-center text-center p-4">
                <div 
                  className={`metric-icon-container ${card.gradient} mb-3`} 
                  style={{ width: '64px', height: '64px', fontSize: '1.8rem' }}
                >
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <h4 className="fw-bold mb-2 text-dark">{card.title}</h4>
                <p className="text-secondary small m-0">{card.desc}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inicio;