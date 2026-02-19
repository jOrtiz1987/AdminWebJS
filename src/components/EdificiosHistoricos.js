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

    // Formulario básico, se puede expandir con más campos según sea necesario
    return (
      <div className="modal show" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? 'Editar Edificio Historico' : 'Agregar Edificio Historico'}</h5>
              <button type="button" className="close" onClick={this.handleCloseForm}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Edificio Historico:</label>
                  <input type="text" name="descripcion" className="form-control" value={this.state.formData.descripcion} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Latitud:</label>
                  <input type="text" name="latitud" className="form-control" value={this.state.formData.latitud} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Longitud:</label>
                  <input type="text" name="longitud" className="form-control" value={this.state.formData.longitud} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Contenido:</label>
                  <input type="text" name="contenido" className="form-control" value={this.state.formData.contenido} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Referencia Imagen:</label>
                  <input type="text" name="referenciaImagen" className="form-control" value={this.state.formData.referenciaImagen} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Categoria:</label>
                  <select
                    name="id"
                    className="form-control"
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
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={this.handleCloseForm}>Cerrar</button>
              <button type="button" className="btn btn-primary" onClick={() => isEdit ? this.modifyUser(editUserData.id) : this.addUser()}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { data, error, showAddEditForm } = this.state;

    return (
      <div className="container mt-3">
        <h2 className="mb-4">Edificios Historicos:</h2>
        <button className="btn btn-primary mb-2" onClick={() => this.handleShowForm()}>Agregar Edificio Historico</button>
        {showAddEditForm && this.renderForm()}
        <div className='container'>
          <div className='row'>
            {data.map((item) => (
              <div className='col-md-4'>
                <Edificio datos={item} />
                <button className="btn btn-secondary btn-sm mr-2" onClick={() => this.handleShowForm(item)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => this.deleteUser(item.id)}>Eliminar</button>
              </div>
            ))}
          </div>
        </div>
      </div>

    );
  }
}

export default EdificiosHistoricos;
