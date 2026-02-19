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

    // Formulario básico, se puede expandir con más campos según sea necesario
    return (
      <div className="modal show" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? 'Editar Categoria' : 'Agregar Categoria'}</h5>
              <button type="button" className="close" onClick={this.handleCloseForm}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Categoria:</label>
                  <input type="text" name="descripcion" className="form-control" value={this.state.formData.descripcion} onChange={this.handleFormChange} />
                </div>
                {/* Otros campos aquí */}
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
        <h2 className="mb-4">Categorias:</h2>
        <button className="btn btn-primary mb-2" onClick={() => this.handleShowForm()}>Agregar Categoria</button>
        {showAddEditForm && this.renderForm()}
        {error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Categoria</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.descripcion}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm mr-2" onClick={() => this.handleShowForm(item)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => this.deleteUser(item.id)}>Eliminar</button>
                    </td>
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

export default Categorias;
