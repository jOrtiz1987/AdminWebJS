import React from 'react';

import { Link } from 'react-router-dom';

function Inicio() {
  const cards = [
    { title: 'Edificios Históricos', path: '/edificios-historicos', icon: '🏛️', desc: 'Gestionar catálogo de monumentos' },
    { title: 'Usuarios', path: '/usuarios', icon: '👥', desc: 'Administrar acceso y roles' },
    { title: 'Visitas', path: '/visitas', icon: '📍', desc: 'Registro de actividad turística' },
    { title: 'Categorías', path: '/categorias', icon: '🏷️', desc: 'Clasificación de sitios' },
    { title: 'Periodos', path: '/periodos', icon: '📅', desc: 'Temporadas vacacionales' },
    { title: 'Coordenadas', path: '/registroCoordenadas', icon: '🗺️', desc: 'Ubicaciones geográficas' },
  ];

  return (
    <div>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold" style={{ color: 'var(--primary-color)' }}>Panel de Administración</h1>
        <p className="lead text-secondary">Bienvenido al sistema de gestión de Turismo de Zacatecas.</p>
      </div>

      <div className="row g-4">
        {cards.map((card, index) => (
          <div key={index} className="col-md-6 col-lg-4">
            <Link to={card.path} style={{ textDecoration: 'none' }}>
              <div className="card-modern h-100 d-flex flex-column align-items-center text-center">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{card.icon}</div>
                <h3 className="h5 mb-3">{card.title}</h3>
                <p className="text-muted small">{card.desc}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inicio;