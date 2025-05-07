import React, { useState, useEffect } from 'react';
import axios from 'axios';

class Visitas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/visitas');
      this.setState({ data: response.data });
    } catch (error) {
      this.setState({ error: 'Error fetching data' });
    }
  };

  render() {
    const { data, error } = this.state;

    return (
      <div className="container mt-3">
      <h2 className="mb-4">Visitas:</h2>
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Edificio Historico</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Niños</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.idEdificioHistorico}</td>
                  <td>{item.idUsuario}</td>
                  <td>{item.fecha}</td>
                  <td>{item.llevaNinos}</td>
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

export default Visitas;
