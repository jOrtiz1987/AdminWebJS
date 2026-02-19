import React from "react";
import image1 from "../assets/image1.jpg"

function Edificio(props) {
    return (
        <div className="card">
            <img src={props.datos.referenciaImagen || image1} alt={props.datos.descripcion} className="card-img-top edificio-image" />
            <div className="card-body">
                <h4 className="card-title">{props.datos.descripcion}</h4>
                <p className="card-text text-secondary">{props.datos.contenido}</p>
            </div>
        </div>
    )
}

export default Edificio;