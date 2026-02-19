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

    this.setState({ data: datosFiltrados });
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


  render() {
    const { data, error, usuarios, filtroUsuarioId, filtroFechaInicio } = this.state;

    return (
      <div className="container mt-3">
        <h2 className="mb-4">Registro de Coordenadas:</h2>

        {/* --- FORMULARIO DE FILTROS --- */}
        <div className="card mb-4 p-3">
          <h5>Filtros de Búsqueda</h5>
          <form onSubmit={this.handleBuscar} className="form-inline">

            {/* Filtro por Usuario */}
            <div className="form-group mr-3 mb-2">
              <label htmlFor="filtroUsuarioId" className="mr-2">Usuario:</label>
              <select
                id="filtroUsuarioId"
                name="filtroUsuarioId"
                className="form-control"
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
            <div className="form-group mr-3 mb-2">
              <label htmlFor="filtroFechaInicio" className="mr-2">Fecha Desde:</label>
              <input
                id="filtroFechaInicio"
                type="date"
                name="filtroFechaInicio"
                className="form-control"
                value={filtroFechaInicio}
                onChange={this.handleFiltroChange}
              />
            </div>

            {/* Botón de Búsqueda */}
            <button type="submit" className="btn btn-primary mb-2">Buscar</button>

            {/* Botón de Exportar Excel */}
            <button
              type="button"
              onClick={this.exportToExcel}
              className="btn btn-success mb-2 ms-2"
            >
              Descargar Excel
            </button>

          </form>
        </div>
        {/* --- FIN FORMULARIO DE FILTROS --- */}

        {error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Latitud</th>
                  <th>Longitud</th>
                  <th>Usuario (ID - Correo)</th>
                  <th>ID Lugar de Interés</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.idRegistroCoordenadas}</td>
                    {/* Formato de fecha corregido */}
                    <td>{new Date(item.fecha).toLocaleString('es-MX')}</td>
                    <td>{item.latitud}</td>
                    <td>{item.longitud}</td>
                    {/* Acceso a objeto anidado */}
                    <td>
                      {item.usuario
                        ? `${item.usuario.idUsuario} - ${item.usuario.correo}`
                        : 'Usuario no disponible'
                      }
                    </td>
                    <td>N/A</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default RegistroCoordenadas;