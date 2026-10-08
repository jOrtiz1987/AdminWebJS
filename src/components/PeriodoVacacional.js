import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

class PeriodoVacacional extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
      showAddEditForm: false,
      editUserData: null, // Datos del usuario a editar
      usuarios: [],
      currentPage: 1,
      itemsPerPage: 10,
      formData: {
        presupuesto: '',
        fechaInicioEstimada: '',
        fechaFinEstimada: '',
        fechaInicioReal: '',
        fechaFinReal: '',
        usuario: { idUsuario: '' },
      }
    };
  }

  // Actualiza el estado del formulario
  handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'idUsuario') {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          usuario: {
            ...prevState.formData.usuario,
            idUsuario: value
          }
        }
      }));
    } else {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          [name]: value
        }
      }));
    }
  }

  componentDidMount() {
    this.fetchData();
    this.fetchUsuarios();
  }

  fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/periodos`);
      this.setState({ data: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching data' });
    }
  };

  fetchUsuarios = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuarios`);
      this.setState({ usuarios: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching usuarios' });
    }
  };

  // Método para agregar usuario
  addUser = async (userData) => {
    try {
      this.state.formData.fechaInicioReal = this.state.formData.fechaInicioEstimada;
      this.state.formData.fechaFinReal = this.state.formData.fechaFinEstimada;
      await axios.post(`${API_BASE_URL}/api/periodos`, this.state.formData);
      this.fetchData(); // Recargar la lista de periodos
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error adding data' });
    }
  };

  // Método para modificar usuario
  modifyUser = async (userId, updatedData) => {
    try {
      this.state.formData.fechaInicioReal = this.state.formData.fechaInicioEstimada;
      this.state.formData.fechaFinReal = this.state.formData.fechaFinEstimada;
      await axios.put(`${API_BASE_URL}/api/periodos/${userId}`, this.state.formData);
      this.fetchData(); // Recargar la lista de periodos
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error modify data' });
    }
  };

  // Método para eliminar usuario
  deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/periodos/${userId}`);
      this.fetchData(); // Recargar la lista de periodos
    } catch (error) {
      this.setState({ error: 'Error delete data' });
    }
  };

  // Manejar la apertura del formulario con datos para editar o vacío para agregar
  handleShowForm = (userData = null) => {
    this.setState({
      showAddEditForm: true, editUserData: userData, formData: userData || {
        presupuesto: '',
        fechaInicioEstimada: '',
        fechaFinEstimada: '',
        fechaInicioReal: '',
        fechaFinReal: '',
        usuario: { idUsuario: '' }
      }
    });
  };

  // Manejar el cierre del formulario
  handleCloseForm = () => {
    this.setState({ showAddEditForm: false, editUserData: null });
  };

  // Renderiza el formulario para agregar/editar usuarios
  renderForm = () => {
    const { editUserData } = this.state;
    const isEdit = editUserData !== null;

    return (
      <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-dark">{isEdit ? '📅 Editar Periodo Vacacional' : '📅 Agregar Periodo Vacacional'}</h5>
              <button type="button" className="btn-close" onClick={this.handleCloseForm} aria-label="Close"></button>
            </div>
            <div className="modal-body py-3">
              <form>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Asignar a Usuario:</label>
                  <select
                    name="idUsuario"
                    className="form-select"
                    value={this.state.formData.usuario.idUsuario}
                    onChange={this.handleFormChange} >
                    <option value="">Seleccione un usuario</option>
                    {this.state.usuarios.map((usuario) => (
                      <option key={usuario.idUsuario} value={usuario.idUsuario}>
                        {usuario.nombre} ({usuario.correo})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Presupuesto ($):</label>
                  <input type="text" name="presupuesto" className="form-control" value={this.state.formData.presupuesto} onChange={this.handleFormChange} placeholder="Ej. 5000" />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col">
                    <label className="form-label fw-semibold text-secondary small">Inicio Estimado:</label>
                    <input type="date" name="fechaInicioEstimada" className="form-control" value={this.state.formData.fechaInicioEstimada} onChange={this.handleFormChange} />
                  </div>
                  <div className="col">
                    <label className="form-label fw-semibold text-secondary small">Fin Estimado:</label>
                    <input type="date" name="fechaFinEstimada" className="form-control" value={this.state.formData.fechaFinEstimada} onChange={this.handleFormChange} />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-top-0 pt-0 gap-2">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={this.handleCloseForm}>Cancelar</button>
              <button type="button" className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => isEdit ? this.modifyUser(editUserData.idPeriodoVacacional) : this.addUser()}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  setPage = (page) => {
    this.setState({ currentPage: page });
  };

  render() {
    const { data, error, showAddEditForm, currentPage, itemsPerPage } = this.state;
    
    // Calcular paginación
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="container-fluid fade-in-tab">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold m-0"><i className="bi bi-calendar-range-fill text-primary me-2"></i>Periodos Vacacionales</h2>
          <button className="btn btn-primary shadow-sm rounded-pill px-4" onClick={() => this.handleShowForm()}>
            <i className="bi bi-plus-lg me-2"></i>Agregar Periodo
          </button>
        </div>

        {showAddEditForm && this.renderForm()}
        
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
                    <th className="border-0">Usuario</th>
                    <th className="border-0">Presupuesto</th>
                    <th className="border-0">Periodo Estimado</th>
                    <th className="border-0">Periodo Real</th>
                    <th className="border-0 text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {paginatedData.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold text-secondary">#{item.idPeriodoVacacional}</td>
                      <td className="fw-semibold text-dark">{item.usuario?.nombre || 'N/A'}</td>
                      <td>
                        <span className="badge bg-success-soft text-success px-2.5 py-1.5 fw-bold">
                          ${item.presupuesto}
                        </span>
                      </td>
                      <td className="small text-secondary">
                        {new Date(item.fechaInicioEstimada).toLocaleDateString('es-MX')} al {new Date(item.fechaFinEstimada).toLocaleDateString('es-MX')}
                      </td>
                      <td className="small text-secondary">
                        {new Date(item.fechaInicioReal).toLocaleDateString('es-MX')} al {new Date(item.fechaFinReal).toLocaleDateString('es-MX')}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-light btn-sm me-2 text-primary" onClick={() => this.handleShowForm(item)}>
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button className="btn btn-light btn-sm text-danger" onClick={() => this.deleteUser(item.idPeriodoVacacional)}>
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 p-3 border-top">
                <span className="small text-secondary">
                  Mostrando del {startIndex + 1} al {Math.min(startIndex + itemsPerPage, data.length)} de {data.length} periodos
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

export default PeriodoVacacional;
