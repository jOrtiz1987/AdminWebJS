import React, { Component, useState } from 'react';
import 'aframe';
import 'aframe-ar';

class ARImage extends Component {
  constructor() {
    super();
    this.state = {
      selectedPattern: 'URL_DEL_PRIMER_PATRON',
    };
  }

  handlePatternChange = (newPattern) => {
    this.setState({ selectedPattern: newPattern });
  };

  componentDidMount() {
    this.setupAR();
  }

  setupAR = () => {
    const { videoUrl, targetSize } = this.props;

    const scene = document.querySelector('a-scene');
    const marker = document.createElement('a-marker');
    marker.setAttribute('type', 'pattern');
    marker.setAttribute('url', this.state.selectedPattern);
    scene.appendChild(marker);

    const image = document.createElement('a-image');
    image.setAttribute('src', videoUrl);
    image.setAttribute('scale', targetSize);
    marker.appendChild(image);
  }

  componentDidUpdate(prevProps) {
    if (this.props.videoUrl !== prevProps.videoUrl) {
      // Reconfigurar AR.js si la URL de la imagen cambia
      this.setupAR();
    }
  }

  render() {
    return (
      <div className="App">
        <h1>Aplicación de Realidad Aumentada con React</h1>
        <button onClick={() => this.handlePatternChange('../assets/image1.jpg')}>
          Seleccionar Patrón 1
        </button>
        <button onClick={() => this.handlePatternChange('../assets/casirijilla.obj')}>
          Seleccionar Patrón 2
        </button>
        <a-scene embedded arjs="sourceType: webcam;">
            <a-marker type="pattern">
                <a-box position="0 0.5 0" rotation="0 45 0" color="red" scale="0.4 0.4 0.4"></a-box>
            </a-marker>
        </a-scene>
      </div>
    );
  }
}

export default ARImage;
