import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

class Categorias extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
      showAddEditForm: false,
      editUserData: null, // Datos del categoria a editar
      formData: {
        descripcion: '',
      }
    };
  }

  // Actualiza el estado del formulario
  handleFormChange = (e) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [e.target.name]: e.target.value
      }
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categorias`);
      this.setState({ data: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching data' });
    }
  };

  // Método para agregar categoria
  addUser = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/categorias`, this.state.formData);
      this.fetchData(); // Recargar la lista de categorias
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error adding data' });
    }
  };

  // Método para modificar categoria
  modifyUser = async (userId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/categorias/${userId}`, this.state.formData);
      this.fetchData(); // Recargar la lista de categorias
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error modify data' });
    }
  };

  // Método para eliminar categoria
  deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/categorias/${userId}`);
      this.fetchData(); // Recargar la lista de categorias
    } catch (error) {
      this.setState({ error: 'Error delete data' });
    }
  };

  // Manejar la apertura del formulario con datos para editar o vacío para agregar
  handleShowForm = (userData = null) => {
    this.setState({ showAddEditForm: true, editUserData: userData, formData: userData || { descripcion: '' } });
  };

  // Manejar el cierre del formulario
  handleCloseForm = () => {
    this.setState({ showAddEditForm: false, editUserData: null });
  };

  // Renderiza el formulario para agregar/editar categorias
  renderForm = () => {
    const { editUserData } = this.state;
    const isEdit = editUserData !== null;

    return (
      <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-dark">{isEdit ? '🏷️ Editar Categoría' : '🏷️ Agregar Categoría'}</h5>
              <button type="button" className="btn-close" onClick={this.handleCloseForm} aria-label="Close"></button>
            </div>
            <div className="modal-body py-3">
              <form>
                <div className="mb-2">
                  <label className="form-label fw-semibold text-secondary small">Nombre de la Categoría:</label>
                  <input type="text" name="descripcion" className="form-control" value={this.state.formData.descripcion} onChange={this.handleFormChange} placeholder="Ej. Museo, Templo, Parque..." />
                </div>
              </form>
            </div>
            <div className="modal-footer border-top-0 pt-0 gap-2">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={this.handleCloseForm}>Cancelar</button>
              <button type="button" className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => isEdit ? this.modifyUser(editUserData.id) : this.addUser()}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { data, error, showAddEditForm } = this.state;

    return (
      <div className="container-fluid fade-in-tab">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold m-0"><i className="bi bi-tags-fill text-primary me-2"></i>Categorías</h2>
          <button className="btn btn-primary shadow-sm rounded-pill px-4" onClick={() => this.handleShowForm()}>
            <i className="bi bi-plus-lg me-2"></i>Agregar Categoría
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
                    <th className="border-0">Categoría</th>
                    <th className="border-0 text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold text-secondary">#{item.id}</td>
                      <td className="fw-semibold text-dark">{item.descripcion}</td>
                      <td className="text-end">
                        <button className="btn btn-light btn-sm me-2 text-primary" onClick={() => this.handleShowForm(item)}>
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button className="btn btn-light btn-sm text-danger" onClick={() => this.deleteUser(item.id)}>
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Categorias;
