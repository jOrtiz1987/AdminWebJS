import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

class Visitas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
      currentPage: 1,
      itemsPerPage: 10,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/visitas`);
      this.setState({ data: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching data' });
    }
  };

  setPage = (page) => {
    this.setState({ currentPage: page });
  };

  render() {
    const { data, error, currentPage, itemsPerPage } = this.state;
    
    // Calcular paginación
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="container-fluid fade-in-tab">
        <h2 className="fw-bold mb-4"><i className="bi bi-geo-alt-fill text-primary me-2"></i>Registro de Actividad de Visitas</h2>

        {error ? (
          <div className="alert alert-danger shadow-sm border-0" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        ) : (
          <div className="card-modern border-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="border-0">Lugar de Interés (ID)</th>
                    <th className="border-0">Usuario (ID)</th>
                    <th className="border-0">Fecha / Hora de Registro</th>
                    <th className="border-0 text-center">¿Lleva Niños?</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-semibold text-dark">
                          <i className="bi bi-bank text-secondary me-2"></i>Edificio #{item.idEdificioHistorico}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark px-2.5 py-1.5 border">
                            <i className="bi bi-person-fill me-1"></i>Usuario #{item.idUsuario}
                          </span>
                        </td>
                        <td className="small text-secondary">
                          {new Date(item.fecha).toLocaleString('es-MX')}
                        </td>
                        <td className="text-center">
                          {item.llevaNinos ? (
                            <span className="badge bg-success-soft text-success px-3 py-2 rounded-pill fw-semibold">
                              <i className="bi bi-check-circle-fill me-1"></i> Sí
                            </span>
                          ) : (
                            <span className="badge bg-danger-soft text-danger px-3 py-2 rounded-pill fw-semibold">
                              <i className="bi bi-x-circle-fill me-1"></i> No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        <i className="bi bi-exclamation-circle me-2"></i> No se encontraron registros de visitas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 p-3 border-top">
                <span className="small text-secondary">
                  Mostrando del {startIndex + 1} al {Math.min(startIndex + itemsPerPage, data.length)} de {data.length} visitas
                </span>
                <nav>
                  <ul className="pagination pagination-sm m-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => this.setPage(currentPage - 1)}>Anterior</button>
                    </li>
                    {[...Array(totalPages).keys()].map(pageIdx => {
                      const pageNum = pageIdx + 1;
                      if (totalPages > 10 && Math.abs(currentPage - pageNum) > 3 && pageNum !== 1 && pageNum !== totalPages) {
                        return null;
                      }
                      return (
                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => this.setPage(pageNum)}>{pageNum}</button>
                        </li>
                      );
                    })}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => this.setPage(currentPage + 1)}>Siguiente</button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Visitas;
