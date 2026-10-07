import React from "react";
import image1 from "../assets/image1.jpg"

function Edificio(props) {
    const imageUrl = props.datos.referenciaImagen 
        ? (props.datos.referenciaImagen.startsWith('/') 
            ? process.env.PUBLIC_URL + props.datos.referenciaImagen 
            : props.datos.referenciaImagen)
        : image1;

    return (
        <div className="card-modern border-0 p-0 overflow-hidden h-100 mb-4" style={{ display: 'flex', flexDirection: 'column' }}>
            <img 
                src={imageUrl} 
                alt={props.datos.descripcion} 
                className="edificio-image" 
                style={{ height: '180px', objectFit: 'cover' }}
            />
            <div className="p-3 d-flex flex-column flex-grow-1">
                <span className="badge bg-primary-soft text-primary align-self-start mb-2 small">{props.datos.categoria?.descripcion || 'Edificio'}</span>
                <h5 className="fw-bold text-dark mb-2">{props.datos.descripcion}</h5>
                <p className="text-secondary small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '60px' }}>{props.datos.contenido}</p>
                <div className="d-flex gap-2 mt-3 pt-2 border-top">
                    <button className="btn btn-light btn-sm text-primary flex-grow-1 rounded-pill" onClick={props.onEdit}>
                        <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button className="btn btn-light btn-sm text-danger flex-grow-1 rounded-pill" onClick={props.onDelete}>
                        <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Edificio;