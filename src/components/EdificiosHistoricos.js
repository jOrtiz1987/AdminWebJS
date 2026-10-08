import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import Edificio from './Edificio';

class EdificiosHistoricos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
      showAddEditForm: false,
      editUserData: null, // Datos del edificio a editar
      categorias: [],
      formData: {
        descripcion: '',
        latitud: '',
        longitud: '',
        referenciaImagen: '',
        contenido: '',
        categoria: { id: '' },
      }
    };
  }

  // Actualiza el estado del formulario
  handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'id') {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          categoria: {
            ...prevState.formData.categoria,
            id: value
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
    this.fetchCategorias();
  }

  fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/edificios`);
      this.setState({ data: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching data' });
    }
  };

  fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categorias`);
      this.setState({ categorias: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching categories' });
    }
  };

  // Método para agregar edificio
  addUser = async (userData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/edificios`, this.state.formData);
      this.fetchData(); // Recargar la lista de edificios
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error adding data' });
    }
  };

  // Método para modificar edificio
  modifyUser = async (userId, updatedData) => {
    try {
      await axios.put(`${API_BASE_URL}/api/edificios/${userId}`, this.state.formData);
      this.fetchData(); // Recargar la lista de edificios
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error modify data' });
    }
  };

  // Método para eliminar edificio
  deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/edificios/${userId}`);
      this.fetchData(); // Recargar la lista de edificios
    } catch (error) {
      this.setState({ error: 'Error delete data' });
    }
  };

  // Manejar la apertura del formulario con datos para editar o vacío para agregar
  handleShowForm = (userData = null) => {
    this.setState({
      showAddEditForm: true, editUserData: userData, formData: userData || {
        descripcion: '',
        latitud: '',
        longitud: '',
        referenciaImagen: '',
        contenido: '',
        categoria: { id: '' }
      }
    });
  };

  // Manejar el cierre del formulario
  handleCloseForm = () => {
    this.setState({ showAddEditForm: false, editUserData: null });
  };

  // Renderiza el formulario para agregar/editar edificios
  renderForm = () => {
    const { editUserData } = this.state;
    const isEdit = editUserData !== null;

    return (
      <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-dark">{isEdit ? '✏️ Editar Edificio Histórico' : '🏛️ Agregar Edificio Histórico'}</h5>
              <button type="button" className="btn-close" onClick={this.handleCloseForm} aria-label="Close"></button>
            </div>
            <div className="modal-body py-3">
              <form>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Nombre del Edificio:</label>
                  <input type="text" name="descripcion" className="form-control" value={this.state.formData.descripcion} onChange={this.handleFormChange} placeholder="Ej. Catedral de Zacatecas" />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col">
                    <label className="form-label fw-semibold text-secondary small">Latitud:</label>
                    <input type="text" name="latitud" className="form-control" value={this.state.formData.latitud} onChange={this.handleFormChange} placeholder="Ej. 22.77" />
                  </div>
                  <div className="col">
                    <label className="form-label fw-semibold text-secondary small">Longitud:</label>
                    <input type="text" name="longitud" className="form-control" value={this.state.formData.longitud} onChange={this.handleFormChange} placeholder="Ej. -102.57" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Resumen / Contenido:</label>
                  <textarea name="contenido" className="form-control" rows="3" value={this.state.formData.contenido} onChange={this.handleFormChange} placeholder="Breve reseña histórica..." style={{ resize: 'none' }} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">URL Referencia Imagen:</label>
                  <input type="text" name="referenciaImagen" className="form-control" value={this.state.formData.referenciaImagen} onChange={this.handleFormChange} placeholder="https://ejemplo.com/imagen.jpg" />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold text-secondary small">Categoría:</label>
                  <select
                    name="id"
                    className="form-select"
                    value={this.state.formData.categoria.id}
                    onChange={this.handleFormChange} >
                    <option value="">Seleccione una categoría</option>
                    {this.state.categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.descripcion}
                      </option>
                    ))}
                  </select>
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
          <h2 className="fw-bold m-0"><i className="bi bi-bank text-primary me-2"></i>Edificios Históricos</h2>
          <button className="btn btn-primary shadow-sm rounded-pill px-4" onClick={() => this.handleShowForm()}>
            <i className="bi bi-plus-lg me-2"></i>Agregar Edificio
          </button>
        </div>

        {showAddEditForm && this.renderForm()}

        {error ? (
          <div className="alert alert-danger shadow-sm border-0" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        ) : (
          <div className="row g-4">
            {data.map((item) => (
              <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                <Edificio 
                  datos={item} 
                  onEdit={() => this.handleShowForm(item)}
                  onDelete={() => this.deleteUser(item.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default EdificiosHistoricos;
