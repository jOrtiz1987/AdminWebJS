import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const ARComponent = () => {
  const arScene = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Configurar el objeto loader para cargar el modelo .obj
    const loader = new OBJLoader();

    // Configurar la posición y orientación de la cámara
    camera.position.z = 5;

    // Cargar el modelo .obj
    loader.load('../assets/casirijilla.obj', (object) => {
      scene.add(object);
    },
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( 'An error happened' );
    });

    // Configurar el renderizador y la escena
    renderer.setSize(window.innerWidth, window.innerHeight);
    arScene.current.appendChild(renderer.domElement);

    // Animación de renderizado
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotar el objeto (esto es solo un ejemplo, puedes personalizarlo)
      if (scene.children.length > 0) {
        scene.children[0].rotation.x += 0.005;
        scene.children[0].rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();
  }, []);

  return (
    <div ref={arScene} />
  );
};

export default ARComponent;
