import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

class Usuarios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
      showAddEditForm: false,
      editUserData: null, // Datos del usuario a editar
      formData: {
        nombre: '',
        correo: '',
        password: '',
        genero: '',
        fechaDeNacimiento: '',
        codigoPostal: '',
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
      const response = await axios.get(`${API_BASE_URL}/api/usuarios`);
      this.setState({ data: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching data' });
    }
  };

  // Método para agregar usuario
  addUser = async (userData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/usuarios`, this.state.formData);
      this.fetchData(); // Recargar la lista de usuarios
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error adding data' });
    }
  };

  // Método para modificar usuario
  modifyUser = async (userId, updatedData) => {
    try {
      await axios.put(`${API_BASE_URL}/api/usuarios/${userId}`, this.state.formData);
      this.fetchData(); // Recargar la lista de usuarios
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error modify data' });
    }
  };

  // Método para eliminar usuario
  deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/usuarios/${userId}`);
      this.fetchData(); // Recargar la lista de usuarios
    } catch (error) {
      this.setState({ error: 'Error delete data' });
    }
  };

  // Manejar la apertura del formulario con datos para editar o vacío para agregar
  handleShowForm = (userData = null) => {
    this.setState({
      showAddEditForm: true, editUserData: userData, formData: userData || {
        nombre: '',
        correo: '',
        password: '',
        genero: '',
        fechaDeNacimiento: '',
        codigoPostal: ''
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

    // Formulario básico, se puede expandir con más campos según sea necesario
    return (
      <div className="modal show" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? 'Editar Usuario' : 'Agregar Usuario'}</h5>
              <button type="button" className="close" onClick={this.handleCloseForm}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input type="text" name="nombre" className="form-control" value={this.state.formData.nombre} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Correo:</label>
                  <input type="email" name="correo" className="form-control" value={this.state.formData.correo} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Clave:</label>
                  <input type="text" name="password" className="form-control" value={this.state.formData.password} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Genero:</label>
                  <input type="text" name="genero" className="form-control" value={this.state.formData.genero} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Codigo Postal:</label>
                  <input type="text" name="codigoPostal" className="form-control" value={this.state.formData.codigoPostal} onChange={this.handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento:</label>
                  <input type="date" name="fechaDeNacimiento" className="form-control" value={this.state.formData.fechaDeNacimiento} onChange={this.handleFormChange} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={this.handleCloseForm}>Cerrar</button>
              <button type="button" className="btn btn-primary" onClick={() => isEdit ? this.modifyUser(editUserData.idUsuario) : this.addUser()}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { data, error, showAddEditForm } = this.state;

    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold"><i className="bi bi-people-fill me-2"></i>Usuarios</h2>
          <button className="btn btn-primary" onClick={() => this.handleShowForm()}>
            <i className="bi bi-plus-lg me-2"></i>Agregar Usuario
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
                    <th className="border-0">Nombre</th>
                    <th className="border-0">Género</th>
                    <th className="border-0">C.P.</th>
                    <th className="border-0">Correo</th>
                    <th className="border-0">Acciones</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold text-secondary">#{item.idUsuario}</td>
                      <td className="fw-semibold">{item.nombre}</td>
                      <td>
                        <span className={`badge ${item.genero === 'M' ? 'bg-info' : 'bg-warning'} text-dark bg-opacity-25`}>
                          {item.genero}
                        </span>
                      </td>
                      <td className="text-muted">{item.codigoPostal}</td>
                      <td>{item.correo}</td>
                      <td>
                        <button className="btn btn-light btn-sm me-2 text-primary" onClick={() => this.handleShowForm(item)}>
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button className="btn btn-light btn-sm text-danger" onClick={() => this.deleteUser(item.idUsuario)}>
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

export default Usuarios;
