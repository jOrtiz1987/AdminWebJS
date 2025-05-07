import React from "react";
import image1 from "../assets/image1.jpg"

function Edificio(props){
    return(
        <div className="card">
            <img src={image1} alt="Edificio" className="card-img-top" />
            <div className="card-body">
                <h4 className="card-title">{props.datos.descripcion}</h4>
                <p className="card-text text-secondary">{props.datos.contenido}</p>
            </div>
        </div>
    )
}

export default Edificio;