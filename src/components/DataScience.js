import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const DataScience = () => {
    const [loadingMeta, setLoadingMeta] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);
    const [error, setError] = useState(null);

    const [reportId, setReportId] = useState(null);
    const [summary, setSummary] = useState(null);
    
    // Nuevos estados para pestañas y búsqueda
    const [activeTab, setActiveTab] = useState('resumen');
    const [searchQuery, setSearchQuery] = useState('');

    // Estados para Recomendador IA
    const [usersList, setUsersList] = useState([]);
    const [buildingsList, setBuildingsList] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [modelType, setModelType] = useState('next_monument'); // 'next_monument' | 'profile' | 'budget'
    const [recommendation, setRecommendation] = useState(null);
    const [profilePrediction, setProfilePrediction] = useState(null);
    const [budgetPrediction, setBudgetPrediction] = useState(null);
    const [recLoading, setRecLoading] = useState(false);
    const [trainLoading, setTrainLoading] = useState(false);
    const [trainSuccess, setTrainSuccess] = useState('');
    const [recError, setRecError] = useState(null);

    // Cargar listas de usuarios y edificios
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/usuarios`)
            .then(res => setUsersList(res.data))
            .catch(err => console.error("Error fetching users", err));
            
        axios.get(`${API_BASE_URL}/api/edificios`)
            .then(res => setBuildingsList(res.data))
            .catch(err => console.error("Error fetching buildings", err));
    }, []);

    const handleGetRecommendation = async () => {
        if (!selectedUser) {
            setRecError("Por favor selecciona un usuario.");
            return;
        }
        if (modelType === 'next_monument' && !selectedBuilding) {
            setRecError("Por favor selecciona un monumento de inicio.");
            return;
        }

        setRecLoading(true);
        setRecError(null);
        setRecommendation(null);
        setProfilePrediction(null);
        setBudgetPrediction(null);
        setTrainSuccess('');

        try {
            if (modelType === 'next_monument') {
                const res = await axios.post(`${API_BASE_URL}/api/reports/recommend/next`, {
                    userId: Number(selectedUser),
                    currentPoiId: Number(selectedBuilding)
                });
                setRecommendation(res.data);
            } else if (modelType === 'profile') {
                const res = await axios.post(`${API_BASE_URL}/api/reports/recommend/profile`, {
                    userId: Number(selectedUser)
                });
                setProfilePrediction(res.data);
            } else if (modelType === 'budget') {
                const res = await axios.post(`${API_BASE_URL}/api/reports/recommend/budget`, {
                    userId: Number(selectedUser)
                });
                setBudgetPrediction(res.data);
            }
        } catch (err) {
            console.error("Error fetching prediction", err);
            setRecError("No se pudo obtener el resultado del modelo de la IA.");
        } finally {
            setRecLoading(false);
        }
    };

    const handleTrainModel = async () => {
        setTrainLoading(true);
        setTrainSuccess('');
        setRecError(null);
        try {
            let endpoint = '/api/reports/recommend/train';
            if (modelType === 'profile') {
                endpoint = '/api/reports/recommend/profile/train';
            } else if (modelType === 'budget') {
                endpoint = '/api/reports/recommend/budget/train';
            }
            const res = await axios.post(`${API_BASE_URL}${endpoint}`);
            setTrainSuccess(res.data?.detail || "Red neuronal entrenada con éxito.");
        } catch (err) {
            console.error("Error training model", err);
            setRecError("Error al entrenar la red neuronal.");
        } finally {
            setTrainLoading(false);
        }
    };

    // URLs del backend Java (no Python directo)
    const heatmapUrl = useMemo(() => (
        reportId ? `${API_BASE_URL}/api/reports/${reportId}/heatmap` : null
    ), [reportId]);

    const clustersUrl = useMemo(() => (
        reportId ? `${API_BASE_URL}/api/reports/${reportId}/clusters` : null
    ), [reportId]);

    const excelUrl = useMemo(() => (
        reportId ? `${API_BASE_URL}/api/reports/${reportId}/excel` : null
    ), [reportId]);

    const handleGenerate = async () => {
        setLoadingMeta(true);
        setError(null);

        try {
            const payload = {
                userIds: null,
                start: null,
                end: null,
                epsM: 120,
                minSamples: 15,
                poiRadiusM: 120,
                visitaLookbackMin: 30
            };

            const res = await axios.post(`${API_BASE_URL}/api/reports/generate/meta`, payload);

            const sum = res.data?.summary;
            const id = sum?.reportId;

            if (!id) {
                throw new Error('No se recibió reportId desde el backend.');
            }

            setReportId(id);
            setSummary(sum);
            setActiveTab('resumen'); // Pestaña por defecto tras generar
        } catch (err) {
            console.error('Error al generar el reporte (meta)', err);
            setError('Ocurrió un error al generar el reporte. Revisa que Python y Java estén corriendo.');
            setReportId(null);
            setSummary(null);
        } finally {
            setLoadingMeta(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (!reportId) {
            setError('Primero genera el reporte para obtener el reportId.');
            return;
        }

        setDownloadingExcel(true);
        setError(null);

        try {
            const response = await axios.get(excelUrl, { responseType: 'blob' });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${reportId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error al descargar el Excel', err);
            setError('No se pudo descargar el Excel. Intenta de nuevo.');
        } finally {
            setDownloadingExcel(false);
        }
    };

    // Auto-cálculo de insights rápidos a partir de los datos
    const insights = useMemo(() => {
        if (!summary) return null;

        let maxVisitsPoi = 'N/A';
        let maxVisits = 0;
        if (summary.resumenEstancia && summary.resumenEstancia.length > 0) {
            const sortedByVisits = [...summary.resumenEstancia].sort((a, b) => b.total_visitas - a.total_visitas);
            maxVisitsPoi = sortedByVisits[0].poi_name;
            maxVisits = sortedByVisits[0].total_visitas;
        }

        let longestStayPoi = 'N/A';
        let longestStayTime = 0;
        if (summary.resumenEstancia && summary.resumenEstancia.length > 0) {
            longestStayPoi = summary.resumenEstancia[0].poi_name;
            longestStayTime = summary.resumenEstancia[0].duracion_promedio_min;
        }

        let favRoute = 'N/A';
        if (summary.rutasPopulares && summary.rutasPopulares.length > 0) {
            favRoute = summary.rutasPopulares[0].ruta_completa;
        }

        return { maxVisitsPoi, maxVisits, longestStayPoi, longestStayTime, favRoute };
    }, [summary]);

    // Filtrar estancias según el buscador
    const filteredEstancia = useMemo(() => {
        if (!summary || !summary.resumenEstancia) return [];
        return summary.resumenEstancia.filter(item => 
            item.poi_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [summary, searchQuery]);

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">
                    <i className="bi bi-graph-up text-primary me-2"></i>
                    Ciencia de Datos y Analíticas
                </h2>
            </div>

            {/* Generador de Reportes Card */}
            <div className="card-modern border-0 p-4 mb-4">
                <h4 className="mb-2">Centro de Control de Datos</h4>
                <p className="text-secondary mb-4">
                    Ejecuta algoritmos de minería de datos (Clustering DBSCAN y Geolocalización) para procesar las coordenadas de los turistas.
                </p>

                {error && (
                    <div className="alert alert-danger shadow-sm border-0 mb-3" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                )}

                <div className="d-flex gap-2 flex-wrap">
                    <button
                        className="btn btn-primary shadow-sm rounded-pill px-4"
                        onClick={handleGenerate}
                        disabled={loadingMeta}
                    >
                        {loadingMeta ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Procesando Minería de Datos...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-cpu-fill me-2"></i>
                                Ejecutar Algoritmo y Generar Reporte
                            </>
                        )}
                    </button>

                    <button
                        className="btn btn-success shadow-sm rounded-pill px-4"
                        onClick={handleDownloadExcel}
                        disabled={!reportId || downloadingExcel}
                    >
                        {downloadingExcel ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Descargando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-file-earmark-excel-fill me-2"></i>
                                Descargar Reporte Completo (Excel)
                            </>
                        )}
                    </button>

                    {reportId && (
                        <button
                            className="btn btn-outline-secondary rounded-pill px-3"
                            onClick={() => {
                                setReportId(null);
                                setSummary(null);
                                setError(null);
                                setActiveTab('resumen');
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise me-2"></i>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Panel de Control de Pestañas */}
            <div>
                {/* Navegación por pestañas */}
                <div className="nav-tabs-custom">
                    <button
                        className={`nav-link-custom ${activeTab === 'resumen' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resumen')}
                    >
                        <i className="bi bi-speedometer2"></i>
                        Panel Resumen
                    </button>
                    <button
                        className={`nav-link-custom ${activeTab === 'estancia' ? 'active' : ''}`}
                        onClick={() => setActiveTab('estancia')}
                    >
                        <i className="bi bi-clock-history"></i>
                        Tiempos de Estancia
                    </button>
                    <button
                        className={`nav-link-custom ${activeTab === 'movilidad' ? 'active' : ''}`}
                        onClick={() => setActiveTab('movilidad')}
                    >
                        <i className="bi bi-compass"></i>
                        Flujos y Secuencias
                    </button>
                    <button
                        className={`nav-link-custom ${activeTab === 'mapas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mapas')}
                    >
                        <i className="bi bi-map"></i>
                        Mapas Espaciales
                    </button>
                    <button
                        className={`nav-link-custom ${activeTab === 'recomendacion' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recomendacion')}
                    >
                        <i className="bi bi-cpu"></i>
                        Recomendador IA
                    </button>
                </div>

                {/* Contenido de Pestañas */}
                <div className="fade-in-tab">
                    
                    {/* 1. PANEL RESUMEN */}
                    {activeTab === 'resumen' && (
                        !summary ? (
                            <div className="card-modern border-0 p-5 text-center text-muted bg-white">
                                <i className="bi bi-info-circle text-primary display-4 mb-3 d-block"></i>
                                <h5>Falta generar el reporte analítico</h5>
                                <p className="mb-0">Haz clic en <strong>"Ejecutar Algoritmo y Generar Reporte"</strong> arriba para calcular las estadísticas.</p>
                            </div>
                        ) : (
                            <div>
                                {/* Tarjetas Métricas */}
                                <div className="row g-3 mb-4">
                                    <div className="col-12 col-sm-6 col-md-3">
                                        <div className="metric-card">
                                            <div>
                                                <div className="text-muted small fw-semibold">PUNTOS GPS</div>
                                                <h3 className="fw-bold m-0 mt-1">{summary.points}</h3>
                                            </div>
                                            <div className="metric-icon-container bg-gradient-blue">
                                                <i className="bi bi-geo-alt"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-3">
                                        <div className="metric-card">
                                            <div>
                                                <div className="text-muted small fw-semibold">TURISTAS SIMULADOS</div>
                                                <h3 className="fw-bold m-0 mt-1">{summary.users}</h3>
                                            </div>
                                            <div className="metric-icon-container bg-gradient-purple">
                                                <i className="bi bi-people"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-3">
                                        <div className="metric-card">
                                            <div>
                                                <div className="text-muted small fw-semibold">VISITAS REGISTRADAS</div>
                                                <h3 className="fw-bold m-0 mt-1">{summary.visitas}</h3>
                                            </div>
                                            <div className="metric-icon-container bg-gradient-green">
                                                <i className="bi bi-clipboard-data"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-3">
                                        <div className="metric-card">
                                            <div>
                                                <div className="text-muted small fw-semibold">CLUSTERS GLOBAL</div>
                                                <h3 className="fw-bold m-0 mt-1">{summary.clustersGlobal}</h3>
                                            </div>
                                            <div className="metric-icon-container bg-gradient-red">
                                                <i className="bi bi-cone-striped"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Insights rápidos */}
                                {insights && (
                                    <div className="row g-3 mb-4">
                                        <div className="col-12 col-md-4">
                                            <div className="insight-card border-start border-primary border-4">
                                                <div className="text-muted small fw-semibold">LUGAR MÁS VISITADO</div>
                                                <h5 className="fw-bold text-dark mt-1 mb-0">{insights.maxVisitsPoi}</h5>
                                                <div className="small text-primary fw-medium mt-1"><i className="bi bi-check2-circle me-1"></i>{insights.maxVisits} visitas registradas</div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <div className="insight-card border-start border-success border-4">
                                                <div className="text-muted small fw-semibold">MAYOR TIEMPO DE ESTANCIA</div>
                                                <h5 className="fw-bold text-dark mt-1 mb-0">{insights.longestStayPoi}</h5>
                                                <div className="small text-success fw-medium mt-1"><i className="bi bi-clock me-1"></i>{insights.longestStayTime} minutos promedio</div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <div className="insight-card border-start border-warning border-4">
                                                <div className="text-muted small fw-semibold">RUTA SECUENCIAL PREFERIDA</div>
                                                <h5 className="fw-bold text-dark mt-1 mb-0" style={{ fontSize: '0.95rem' }}>{insights.favRoute}</h5>
                                                <div className="small text-warning fw-medium mt-1"><i className="bi bi-signpost-split me-1"></i>Flujo peatonal principal</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {/* 2. TIEMPOS DE ESTANCIA */}
                    {activeTab === 'estancia' && (
                        !summary ? (
                            <div className="card-modern border-0 p-5 text-center text-muted bg-white">
                                <i className="bi bi-info-circle text-primary display-4 mb-3 d-block"></i>
                                <h5>Falta generar el reporte analítico</h5>
                                <p className="mb-0">Haz clic en <strong>"Ejecutar Algoritmo y Generar Reporte"</strong> arriba para calcular las estadísticas.</p>
                            </div>
                        ) : (
                            <div className="card-modern border-0 p-4 bg-white">
                                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                    <div>
                                        <h5 className="fw-bold m-0"><i className="bi bi-clock-history me-2 text-success"></i>Tiempos de Estancia Promedio</h5>
                                        <p className="text-muted small m-0 mt-1">Duración calculada del tiempo que pasan los turistas dentro del área de influencia de cada edificio histórico.</p>
                                    </div>
                                    <div className="search-container">
                                        <i className="bi bi-search search-icon"></i>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-sm" 
                                            placeholder="Buscar lugar..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Edificio Histórico</th>
                                                <th className="text-center">Total Visitas</th>
                                                <th className="text-end" style={{ width: '40%' }}>Estancia Promedio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredEstancia.length > 0 ? (
                                                filteredEstancia.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="fw-semibold text-secondary">{item.poi_name}</td>
                                                        <td className="text-center"><span className="badge bg-light text-dark px-3 py-2 border">{item.total_visitas} visitas</span></td>
                                                        <td className="text-end">
                                                            <div className="d-flex align-items-center justify-content-end gap-3">
                                                                <div className="progress flex-grow-1" style={{ height: '8px', maxWidth: '250px' }}>
                                                                    <div 
                                                                        className={`progress-bar ${item.duracion_promedio_min > 45 ? 'bg-success' : item.duracion_promedio_min > 20 ? 'bg-warning' : 'bg-danger'}`} 
                                                                        role="progressbar" 
                                                                        style={{ width: `${Math.min(100, (item.duracion_promedio_min / 90) * 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="fw-bold text-dark">{item.duracion_promedio_min} min</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-4 text-muted">
                                                        <i className="bi bi-search me-2"></i> No se encontraron lugares que coincidan con la búsqueda.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}

                    {/* 3. FLUJOS Y SECUENCIAS */}
                    {activeTab === 'movilidad' && (
                        !summary ? (
                            <div className="card-modern border-0 p-5 text-center text-muted bg-white">
                                <i className="bi bi-info-circle text-primary display-4 mb-3 d-block"></i>
                                <h5>Falta generar el reporte analítico</h5>
                                <p className="mb-0">Haz clic en <strong>"Ejecutar Algoritmo y Generar Reporte"</strong> arriba para calcular las estadísticas.</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {/* Rutas más populares */}
                                <div className="col-12 col-xl-7">
                                    <div className="card-modern border-0 p-4 bg-white h-100">
                                        <h5 className="fw-bold mb-2"><i className="bi bi-compass-fill me-2 text-warning"></i>Rutas Completas Frecuentes</h5>
                                        <p className="text-muted small mb-4">Secuencias completas de visita ordenadas por popularidad.</p>
                                        <div className="list-group list-group-flush">
                                            {summary.rutasPopulares && summary.rutasPopulares.map((item, idx) => (
                                                <div key={idx} className="list-group-item border-0 px-0 py-3 d-flex justify-content-between align-items-center gap-3">
                                                    <div className="d-flex flex-wrap align-items-center gap-1">
                                                        {item.ruta_completa.split(" -> ").map((step, sidx) => (
                                                            <span key={sidx} className="d-flex align-items-center">
                                                                <span className="badge bg-light text-dark border p-2 small fw-normal">{step}</span>
                                                                {sidx < item.ruta_completa.split(" -> ").length - 1 && (
                                                                    <i className="bi bi-arrow-right mx-1 text-muted small"></i>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className="badge bg-primary-soft text-primary rounded-pill px-3 py-2 shrink-0">{item.cantidad} turistas</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Transiciones Populares (Bigramas) */}
                                <div className="col-12 col-xl-5">
                                    <div className="card-modern border-0 p-4 bg-white h-100">
                                        <h5 className="fw-bold mb-2"><i className="bi bi-shuffle me-2 text-danger"></i>Conexiones más Transitadas</h5>
                                        <p className="text-muted small mb-4">Transiciones consecutivas directas de un lugar a otro.</p>
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Origen</th>
                                                        <th></th>
                                                        <th>Destino</th>
                                                        <th className="text-end">Conteo</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {summary.transicionesPopulares && summary.transicionesPopulares.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="text-secondary small fw-semibold">{item.origen}</td>
                                                            <td className="text-center"><i className="bi bi-arrow-right-short text-muted"></i></td>
                                                            <td className="text-secondary small fw-semibold">{item.destino}</td>
                                                            <td className="text-end"><span className="badge bg-danger-soft text-danger px-2.5 py-1.5 fw-bold">{item.cantidad}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* 4. MAPAS INTERACTIVOS */}
                    {activeTab === 'mapas' && (
                        !summary ? (
                            <div className="card-modern border-0 p-5 text-center text-muted bg-white">
                                <i className="bi bi-info-circle text-primary display-4 mb-3 d-block"></i>
                                <h5>Falta generar el reporte analítico</h5>
                                <p className="mb-0">Haz clic en <strong>"Ejecutar Algoritmo y Generar Reporte"</strong> arriba para calcular las estadísticas.</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                <div className="col-12 col-xl-6">
                                    <div className="card-modern border-0 p-3 bg-white">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="fw-bold m-0">
                                                <i className="bi bi-thermometer-sun me-2 text-danger"></i>
                                                Mapa de Calor (Density Heatmap)
                                            </h5>
                                            <a className="btn btn-link p-0 text-decoration-none small" href={heatmapUrl} target="_blank" rel="noreferrer">
                                                <i className="bi bi-box-arrow-up-right me-1"></i> Expandir
                                            </a>
                                        </div>
                                        <iframe
                                            title="heatmap"
                                            src={heatmapUrl}
                                            style={{ width: '100%', height: 500, border: 0, borderRadius: 8 }}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-xl-6">
                                    <div className="card-modern border-0 p-3 bg-white">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="fw-bold m-0">
                                                <i className="bi bi-diagram-3-fill me-2 text-primary"></i>
                                                Mapa de Clusters Globales (DBSCAN)
                                            </h5>
                                            <a className="btn btn-link p-0 text-decoration-none small" href={clustersUrl} target="_blank" rel="noreferrer">
                                                <i className="bi bi-box-arrow-up-right me-1"></i> Expandir
                                            </a>
                                        </div>
                                        <iframe
                                            title="clusters"
                                            src={clustersUrl}
                                            style={{ width: '100%', height: 500, border: 0, borderRadius: 8 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* 5. RECOMENDADOR IA (RED NEURAL) */}
                    {activeTab === 'recomendacion' && (
                        <div className="row g-4">
                            <div className="col-12 col-md-5">
                                <div className="card-modern border-0 p-4 bg-white h-100">
                                    <h5 className="fw-bold mb-2">
                                        <i className="bi bi-robot me-2 text-primary"></i>
                                        Simulador de Inteligencia Artificial (Redes Neuronales)
                                    </h5>
                                    <p className="text-muted small mb-4">
                                        Explora las predicciones analíticas utilizando redes neuronales multicapa (MLP) entrenadas con los datos históricos de los turistas.
                                    </p>
                                    
                                    {recError && (
                                        <div className="alert alert-danger border-0 small mb-3">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>{recError}
                                        </div>
                                    )}
                                    {trainSuccess && (
                                        <div className="alert alert-success border-0 small mb-3">
                                            <i className="bi bi-check-circle-fill me-2"></i>{trainSuccess}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-secondary small">Modelo de Red Neuronal:</label>
                                        <select 
                                            className="form-select" 
                                            value={modelType} 
                                            onChange={(e) => {
                                                setModelType(e.target.value);
                                                setRecommendation(null);
                                                setProfilePrediction(null);
                                                setBudgetPrediction(null);
                                                setRecError(null);
                                                setTrainSuccess('');
                                            }}
                                        >
                                            <option value="next_monument">1. Siguiente Monumento (MLP Classifier)</option>
                                            <option value="profile">2. Perfil del Turista (MLP Classifier)</option>
                                            <option value="budget">3. Presupuesto Estimado (MLP Regressor)</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-secondary small">Turista (Perfil / ID):</label>
                                        <select 
                                            className="form-select" 
                                            value={selectedUser} 
                                            onChange={(e) => setSelectedUser(e.target.value)}
                                        >
                                            <option value="">-- Seleccionar Turista --</option>
                                            {usersList.map(u => (
                                                <option key={u.idUsuario} value={u.idUsuario}>
                                                    {u.nombre} (#{u.idUsuario} - {u.genero === 'Femenino' || u.genero === 'F' ? 'Mujer' : 'Hombre'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {modelType === 'next_monument' ? (
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold text-secondary small">Monumento Actual / de Origen:</label>
                                            <select 
                                                className="form-select" 
                                                value={selectedBuilding} 
                                                onChange={(e) => setSelectedBuilding(e.target.value)}
                                            >
                                                <option value="">-- Seleccionar Monumento --</option>
                                                {buildingsList.map(b => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.descripcion} (#{b.id})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="alert alert-light border-0 small mb-4 py-2 text-secondary">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Este modelo analiza el perfil histórico completo del turista para hacer la estimación. No requiere punto de origen.
                                        </div>
                                    )}

                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-primary shadow-sm rounded-pill px-4 flex-grow-1"
                                            onClick={handleGetRecommendation}
                                            disabled={recLoading}
                                        >
                                            {recLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Analizando...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-lightning-charge-fill me-2"></i>
                                                    Calcular Predicción
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary rounded-pill px-3"
                                            onClick={handleTrainModel}
                                            disabled={trainLoading}
                                            title="Volver a entrenar este modelo de red neuronal con los datos actuales"
                                        >
                                            {trainLoading ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ) : (
                                                <>
                                                    <i className="bi bi-arrow-repeat me-1"></i>
                                                    Entrenar Red
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-7">
                                <div className="card-modern border-0 p-4 bg-white h-100 d-flex flex-column justify-content-center align-items-center text-center">
                                    {!recommendation && !profilePrediction && !budgetPrediction ? (
                                        <div className="text-muted p-5">
                                            <i className="bi bi-cpu-fill text-light display-1 mb-3"></i>
                                            <h5>Listo para Analizar</h5>
                                            <p className="mb-0 small">Elige un turista y haz clic en <strong>"Calcular Predicción"</strong> para activar la red neuronal multicapa seleccionada.</p>
                                        </div>
                                    ) : (
                                        <div className="w-100 text-start">
                                            <h5 className="fw-bold mb-3 text-dark">
                                                <i className="bi bi-graph-up-arrow me-2 text-success"></i>
                                                Resultado de la Red Neuronal
                                            </h5>
                                            
                                            {recommendation && (
                                                <div>
                                                    <div className="border-0 p-4 mb-4 rounded-3 text-white shadow-sm" style={{ backgroundColor: '#10B981', color: '#ffffff' }}>
                                                        <div className="small fw-semibold text-uppercase tracking-wider mb-1" style={{ opacity: 0.85 }}>Siguiente Monumento Recomendado</div>
                                                        <h3 className="fw-bold mb-0 text-white">
                                                            <i className="bi bi-building me-2"></i>
                                                            {buildingsList.find(b => b.id === recommendation.recommended_poi_id)?.descripcion || `Monumento #${recommendation.recommended_poi_id}`}
                                                        </h3>
                                                    </div>

                                                    <h6 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wider">Top 3 Predicciones de la Red:</h6>
                                                    <div className="list-group list-group-flush mb-2">
                                                        {recommendation.top_recommendations.map((rec, idx) => {
                                                            const bName = buildingsList.find(b => b.id === rec.poi_id)?.descripcion || `Monumento #${rec.poi_id}`;
                                                            const percentage = (rec.probability * 100).toFixed(1);
                                                            return (
                                                                <div key={idx} className="py-2 border-0 list-group-item bg-transparent px-0">
                                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                                        <span className="fw-semibold text-dark small">{idx + 1}. {bName}</span>
                                                                        <span className="badge bg-light text-dark border small">{percentage}%</span>
                                                                    </div>
                                                                    <div className="progress" style={{ height: '8px' }}>
                                                                        <div 
                                                                            className="progress-bar bg-primary" 
                                                                            role="progressbar" 
                                                                            style={{ width: `${percentage}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="card-modern border-0 p-3 bg-light text-secondary small mt-3">
                                                        <div className="fw-semibold mb-1"><i className="bi bi-cpu-fill me-2 text-primary"></i>Especificaciones Técnicas del Modelo IA</div>
                                                        <strong>Categoría IA:</strong> Deep Learning (Redes Neuronales Artificiales)<br />
                                                        <strong>Paradigma:</strong> Aprendizaje Supervisado (Supervised Learning)<br />
                                                        <strong>Tipo de Red:</strong> Perceptrón Multicapa de Clasificación (MLPClassifier)<br />
                                                        <strong>Capas Ocultas:</strong> 2 capas densas (64 y 32 neuronas respectivamente)<br />
                                                        <strong>Función de Activación:</strong> ReLU (Rectified Linear Unit)<br />
                                                        <strong>Optimizador:</strong> Adam (Stochastic Gradient Descent)
                                                    </div>
                                                </div>
                                            )}

                                            {profilePrediction && (
                                                <div>
                                                    <div className="border-0 p-4 mb-4 rounded-3 text-white shadow-sm" style={{ backgroundColor: '#10B981', color: '#ffffff' }}>
                                                        <div className="small fw-semibold text-uppercase tracking-wider mb-1" style={{ opacity: 0.85 }}>Perfil de Comportamiento Predicho</div>
                                                        <h3 className="fw-bold mb-0 text-white">
                                                            <i className="bi bi-person-badge me-2"></i>
                                                            Turista {profilePrediction.recommended_profile}
                                                        </h3>
                                                    </div>

                                                    <h6 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wider">Probabilidades por Perfil:</h6>
                                                    <div className="list-group list-group-flush mb-2">
                                                        {profilePrediction.top_profiles.map((p, idx) => {
                                                            const percentage = (p.probability * 100).toFixed(1);
                                                            return (
                                                                <div key={idx} className="py-2 border-0 list-group-item bg-transparent px-0">
                                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                                        <span className="fw-semibold text-dark small">{idx + 1}. Perfil {p.profile}</span>
                                                                        <span className="badge bg-light text-dark border small">{percentage}%</span>
                                                                    </div>
                                                                    <div className="progress" style={{ height: '8px' }}>
                                                                        <div 
                                                                            className="progress-bar bg-primary" 
                                                                            role="progressbar" 
                                                                            style={{ width: `${percentage}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="card-modern border-0 p-3 bg-light text-secondary small mt-3">
                                                        <div className="fw-semibold mb-1"><i className="bi bi-cpu-fill me-2 text-primary"></i>Especificaciones Técnicas del Modelo IA</div>
                                                        <strong>Categoría IA:</strong> Deep Learning (Redes Neuronales Artificiales)<br />
                                                        <strong>Paradigma:</strong> Aprendizaje Supervisado (Supervised Learning)<br />
                                                        <strong>Tipo de Red:</strong> Perceptrón Multicapa de Clasificación (MLPClassifier)<br />
                                                        <strong>Capas Ocultas:</strong> 2 capas densas (32 y 16 neuronas respectivamente)<br />
                                                        <strong>Función de Activación:</strong> ReLU (Rectified Linear Unit)<br />
                                                        <strong>Optimizador:</strong> Adam (Stochastic Gradient Descent)
                                                    </div>
                                                </div>
                                            )}

                                            {budgetPrediction && (
                                                <div>
                                                    <div className="border-0 p-4 mb-4 rounded-3 text-white shadow-sm" style={{ backgroundColor: '#10B981', color: '#ffffff' }}>
                                                        <div className="small fw-semibold text-uppercase tracking-wider mb-1" style={{ opacity: 0.85 }}>Presupuesto Estimado por Regresión MLP</div>
                                                        <h3 className="fw-bold mb-0 text-white">
                                                            <i className="bi bi-cash-coin me-2"></i>
                                                            $ {budgetPrediction.estimated_budget.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                                                        </h3>
                                                    </div>
                                                    
                                                    <div className="card-modern border-0 p-3 bg-light text-secondary small mb-3">
                                                        <i className="bi bi-info-circle-fill me-2 text-primary"></i>
                                                        Esta cantidad es estimada por la red neuronal de regresión en tiempo real a partir del perfil demográfico del turista, el tiempo total de su estancia y el número de monumentos visitados.
                                                    </div>

                                                    <div className="card-modern border-0 p-3 bg-light text-secondary small">
                                                        <div className="fw-semibold mb-1"><i className="bi bi-cpu-fill me-2 text-primary"></i>Especificaciones Técnicas del Modelo IA</div>
                                                        <strong>Categoría IA:</strong> Deep Learning (Redes Neuronales Artificiales)<br />
                                                        <strong>Paradigma:</strong> Aprendizaje Supervisado (Supervised Learning)<br />
                                                        <strong>Tipo de Red:</strong> Perceptrón Multicapa de Regresión (MLPRegressor)<br />
                                                        <strong>Capas Ocultas:</strong> 2 capas densas (32 y 16 neuronas respectivamente)<br />
                                                        <strong>Función de Activación:</strong> ReLU (Rectified Linear Unit)<br />
                                                        <strong>Optimizador:</strong> Adam (Stochastic Gradient Descent)
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default DataScience;
