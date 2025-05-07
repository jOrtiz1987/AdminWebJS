import React, { useState, useEffect } from 'react';
import axios from 'axios';

class PeriodoVacacional extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
      showAddEditForm: false,
      editUserData: null, // Datos del usuario a editar
      usuarios: [],
      formData:{
        presupuesto: '',
        fechaInicioEstimada: '',
        fechaFinEstimada: '',
        fechaInicioReal: '',
        fechaFinReal: '',
        usuario: {idUsuario:''},
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
      const response = await axios.get('http://localhost:8080/api/periodos');
      this.setState({ data: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching data' });
    }
  };

  fetchUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/usuarios');
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
      await axios.post('http://localhost:8080/api/periodos', this.state.formData);
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
      await axios.put(`http://localhost:8080/api/periodos/${userId}`, this.state.formData);
      this.fetchData(); // Recargar la lista de periodos
      this.handleCloseForm();
    } catch (error) {
      this.setState({ error: 'Error modify data' });
    }
  };
  
  // Método para eliminar usuario
  deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8080/api/periodos/${userId}`);
      this.fetchData(); // Recargar la lista de periodos
    } catch (error) {
      this.setState({ error: 'Error delete data' });
    }
  };

  // Manejar la apertura del formulario con datos para editar o vacío para agregar
  handleShowForm = (userData = null) => {
    this.setState({ showAddEditForm: true, editUserData: userData, formData: userData || { presupuesto: '',
    fechaInicioEstimada: '',
    fechaFinEstimada: '',
    fechaInicioReal: '',
    fechaFinReal: '',
    usuario: {idUsuario:''} } });
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
              <h5 className="modal-title">{isEdit ? 'Editar Periodo Vacacional' : 'Agregar Periodo Vacacional'}</h5>
              <button type="button" className="close" onClick={this.handleCloseForm}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
              <div className="form-group">
                  <label>Usuario:</label>
                  <select
                    name="idUsuario"
                    className="form-control"
                    value={this.state.formData.usuario.idUsuario}
                    onChange={this.handleFormChange} >
                    <option value="">Seleccione un usuario</option>
                    {this.state.usuarios.map((usuario) => (
                      <option key={usuario.idUsuario} value={usuario.idUsuario}>
                        {usuario.correo} 
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Presupuesto:</label>
                  <input type="text" name="presupuesto" className="form-control" value={this.state.formData.presupuesto} onChange={this.handleFormChange}/>
                </div>
                <div className="form-group">
                  <label>Inicio Periodo Vacacional:</label>
                  <input type="date" name="fechaInicioEstimada" className="form-control" value={this.state.formData.fechaInicioEstimada} onChange={this.handleFormChange}/>
                </div>
                <div className="form-group">
                  <label>Fin Periodo Vacacional:</label>
                  <input type="date" name="fechaFinEstimada" className="form-control" value={this.state.formData.fechaFinEstimada} onChange={this.handleFormChange}/>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={this.handleCloseForm}>Cerrar</button>
              <button type="button" className="btn btn-primary" onClick={() => isEdit ? this.modifyUser(editUserData.idPeriodoVacacional) : this.addUser()}>Guardar</button>
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
      <h2 className="mb-4">Periodos Vacacionales:</h2>
      <button className="btn btn-primary mb-2" onClick={() => this.handleShowForm()}>Agregar Periodo Vacacional</button>
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
                <th>Presupuesto</th>
                <th>Periodo Vacacional Estimado</th>
                <th>Periodo Vacacional Real</th>
                <th>Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.idPeriodoVacacional}</td>
                  <td>{item.presupuesto}</td>
                  <td>{new Date(item.fechaInicioEstimada).toLocaleDateString('en-GB')} al {new Date(item.fechaFinEstimada).toLocaleDateString('en-GB')}</td>
                  <td>{new Date(item.fechaInicioReal).toLocaleDateString('en-GB')} al {new Date(item.fechaFinReal).toLocaleDateString('en-GB')}</td>
                  <td>{item.usuario.correo}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm mr-2" onClick={() => this.handleShowForm(item)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => this.deleteUser(item.idPeriodoVacacional)}>Eliminar</button>
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

export default PeriodoVacacional;
