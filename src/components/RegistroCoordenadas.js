import React from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

class RegistroCoordenadas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],         // Datos filtrados (para mostrar en la tabla)
      rawData: [],      // Datos crudos completos (sin filtrar)
      usuarios: [],     // Lista de usuarios para el filtro
      error: null,
      filtroUsuarioId: '', // Estado del filtro de usuario
      filtroFechaInicio: '', // Estado del filtro de fecha
      currentPage: 1,
      itemsPerPage: 15,
    };
  }

  componentDidMount() {
    this.fetchData();
    this.fetchUsuarios();
  }

  fetchUsuarios = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuarios`);
      this.setState({ usuarios: response.data });
    } catch (error) {
      // Solo mostramos error de datos, no de usuarios (si fallan los usuarios, los datos aún pueden cargar)
    }
  };

  // Carga TODOS los datos (sin filtros) y llama a aplicar los filtros
  fetchData = async () => {
    try {
      // Llamada sin parámetros, trae TODOS los datos
      const response = await axios.get(`${API_BASE_URL}/api/coordenadas`);
      this.setState({
        rawData: response.data,
        error: null
      }, this.applyFiltros); // Llama a aplicarFiltros después de actualizar el estado
    } catch (error) {
      this.setState({ error: 'Error al obtener los datos del registro de coordenadas.' });
    }
  };

  // Aplica los filtros locales a rawData y actualiza el estado 'data'
  applyFiltros = () => {
    const { rawData, filtroUsuarioId, filtroFechaInicio } = this.state;
    let datosFiltrados = rawData;

    // 1. FILTRO POR USUARIO (si filtroUsuarioId está establecido)
    if (filtroUsuarioId) {
      datosFiltrados = datosFiltrados.filter(item =>
        item.usuario && item.usuario.idUsuario === Number(filtroUsuarioId)
      );
    }

    // 2. FILTRO POR FECHA (si filtroFechaInicio está establecido)
    if (filtroFechaInicio) {
      // Normalizar la fecha del filtro (formato YYYY-MM-DD)
      const fechaFiltro = new Date(filtroFechaInicio + 'T00:00:00');

      datosFiltrados = datosFiltrados.filter(item => {
        // La fecha del ítem de la API (2025-08-22T...)
        const fechaItem = new Date(item.fecha);
        // Compara si la fecha del ítem es mayor o igual a la fecha del filtro (día de inicio)
        return fechaItem >= fechaFiltro;
      });
    }

    this.setState({ data: datosFiltrados, currentPage: 1 });
  };

  // Maneja el cambio en los campos de filtro
  handleFiltroChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  // Maneja la acción de buscar (solo aplica los filtros locales)
  handleBuscar = (e) => {
    e.preventDefault();
    this.applyFiltros();
  };

  // Exporta datos a Excel
  exportToExcel = () => {
    const { data } = this.state;
    const exportData = data.map(item => ({
      ID: item.idRegistroCoordenadas,
      Fecha: new Date(item.fecha).toLocaleString('es-MX'),
      Latitud: item.latitud,
      Longitud: item.longitud,
      Usuario: item.usuario ? `${item.usuario.idUsuario} - ${item.usuario.correo}` : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Coordenadas");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'coordenadas.xlsx');
  };


  setPage = (page) => {
    this.setState({ currentPage: page });
  };

  render() {
    const { data, error, usuarios, filtroUsuarioId, filtroFechaInicio, currentPage, itemsPerPage } = this.state;

    // Calcular paginación
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="container-fluid fade-in-tab">
        <h2 className="fw-bold mb-4"><i className="bi bi-map-fill text-primary me-2"></i>Registro de Coordenadas GPS</h2>

        {/* --- FORMULARIO DE FILTROS --- */}
        <div className="card-modern border-0 p-4 mb-4">
          <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-funnel-fill text-secondary me-2"></i>Filtros de Búsqueda</h5>
          <form onSubmit={this.handleBuscar}>
            <div className="row g-3 align-items-end">
              {/* Filtro por Usuario */}
              <div className="col-12 col-md-4">
                <label htmlFor="filtroUsuarioId" className="form-label fw-semibold text-secondary small">Filtrar por Usuario:</label>
                <select
                  id="filtroUsuarioId"
                  name="filtroUsuarioId"
                  className="form-select"
                  value={filtroUsuarioId}
                  onChange={this.handleFiltroChange}
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.idUsuario} value={usuario.idUsuario}>
                      {usuario.correo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Fecha Desde */}
              <div className="col-12 col-md-4">
                <label htmlFor="filtroFechaInicio" className="form-label fw-semibold text-secondary small">Desde la Fecha:</label>
                <input
                  id="filtroFechaInicio"
                  type="date"
                  name="filtroFechaInicio"
                  className="form-control"
                  value={filtroFechaInicio}
                  onChange={this.handleFiltroChange}
                />
              </div>

              {/* Botones */}
              <div className="col-12 col-md-4 d-flex gap-2">
                <button type="submit" className="btn btn-primary shadow-sm rounded-pill px-4 flex-grow-1">
                  <i className="bi bi-search me-2"></i>Buscar
                </button>
                <button
                  type="button"
                  onClick={this.exportToExcel}
                  className="btn btn-success shadow-sm rounded-pill px-3"
                  disabled={data.length === 0}
                >
                  <i className="bi bi-file-earmark-excel-fill me-1"></i> Excel
                </button>
              </div>
            </div>
          </form>
        </div>
        {/* --- FIN FORMULARIO DE FILTROS --- */}

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
                    <th className="border-0">Id</th>
                    <th className="border-0">Fecha / Hora</th>
                    <th className="border-0">Latitud</th>
                    <th className="border-0">Longitud</th>
                    <th className="border-0">Usuario (Correo)</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-bold text-secondary">#{item.idRegistroCoordenadas}</td>
                        <td className="small text-dark">{new Date(item.fecha).toLocaleString('es-MX')}</td>
                        <td className="fw-semibold text-secondary">{item.latitud}</td>
                        <td className="fw-semibold text-secondary">{item.longitud}</td>
                        <td>
                          {item.usuario ? (
                            <span className="badge bg-primary-soft text-primary px-2.5 py-1.5 small fw-semibold">
                              {item.usuario.correo}
                            </span>
                          ) : (
                            <span className="text-muted">Desconocido</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        <i className="bi bi-exclamation-circle me-2"></i> No se encontraron registros de coordenadas.
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
                  Mostrando del {startIndex + 1} al {Math.min(startIndex + itemsPerPage, data.length)} de {data.length} registros
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

export default RegistroCoordenadas;