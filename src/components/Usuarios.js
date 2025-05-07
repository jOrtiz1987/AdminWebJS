import React, { useState, useEffect } from 'react';
import axios from 'axios';

class Usuarios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
      showAddEditForm: false,
      editUserData: null, // Datos del usuario a editar
      formData:{
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
      const response = await axios.get('http://localhost:8080/api/usuarios');
      this.setState({ data: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching data' });
    }
  };

  // Método para agregar usuario
  addUser = async (userData) => {
    try {
      await axios.post('http://localhost:8080/api/usuarios', this.state.formData);
      this.fetchData(); // Recargar la lista de usuarios
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error adding data' });
    }
  };
  
  // Método para modificar usuario
  modifyUser = async (userId, updatedData) => {
    try {
      await axios.put(`http://localhost:8080/api/usuarios/${userId}`, this.state.formData);
      this.fetchData(); // Recargar la lista de usuarios
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error modify data' });
    }
  };
  
  // Método para eliminar usuario
  deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8080/api/usuarios/${userId}`);
      this.fetchData(); // Recargar la lista de usuarios
    } catch (error) {
      this.setState({ error: 'Error delete data' });
    }
  };

  // Manejar la apertura del formulario con datos para editar o vacío para agregar
  handleShowForm = (userData = null) => {
    this.setState({ showAddEditForm: true, editUserData: userData, formData: userData || { nombre: '',
    correo: '',
    password: '',
    genero: '',
    fechaDeNacimiento: '',
    codigoPostal: '' } });
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
                  <input type="text" name="nombre" className="form-control" value={this.state.formData.nombre} onChange={this.handleFormChange}/>
                </div>
                <div className="form-group">
                  <label>Correo:</label>
                  <input type="email" name="correo" className="form-control" value={this.state.formData.correo} onChange={this.handleFormChange}/>
                </div>
                <div className="form-group">
                  <label>Clave:</label>
                  <input type="password" name="password" className="form-control" value={this.state.formData.password} onChange={this.handleFormChange}/>
                </div>
                <div className="form-group">
                  <label>Genero:</label>
                  <input type="text" name="genero" className="form-control" value={this.state.formData.genero} onChange={this.handleFormChange}/>
                </div>
                <div className="form-group">
                  <label>Codigo Postal:</label>
                  <input type="text" name="codigoPostal" className="form-control" value={this.state.formData.codigoPostal} onChange={this.handleFormChange}/>
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento:</label>
                  <input type="date" name="fechaDeNacimiento" className="form-control" value={this.state.formData.fechaDeNacimiento} onChange={this.handleFormChange}/>
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
      <div className="container mt-3">
      <h2 className="mb-4">Usuarios:</h2>
      <button className="btn btn-primary mb-2" onClick={() => this.handleShowForm()}>Agregar Usuario</button>
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
                <th>Nombre</th>
                <th>Genero</th>
                <th>Codigo Postal</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.idUsuario}</td>
                  <td>{item.nombre}</td>
                  <td>{item.genero}</td>
                  <td>{item.codigoPostal}</td>
                  <td>{item.correo}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm mr-2" onClick={() => this.handleShowForm(item)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => this.deleteUser(item.idUsuario)}>Eliminar</button>
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

export default Usuarios;
