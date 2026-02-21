import React, { useMemo, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const DataScience = () => {
    const [loadingMeta, setLoadingMeta] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);
    const [error, setError] = useState(null);

    const [reportId, setReportId] = useState(null);
    const [summary, setSummary] = useState(null);

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
            // Puedes mandar filtros aquí
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

            // Esperamos que venga summary.reportId
            const sum = res.data?.summary;
            const id = sum?.reportId;

            if (!id) {
                throw new Error('No se recibió reportId desde el backend.');
            }

            setReportId(id);
            setSummary(sum);
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

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">
                    <i className="bi bi-graph-up me-2"></i>
                    Ciencia de Datos
                </h2>
            </div>

            <div className="card-modern border-0 p-4 mb-4">
                <h4 className="mb-3">Generación de Reportes</h4>
                <p className="text-secondary mb-4">
                    Genera un reporte (Excel) y mapas interactivos (heatmap y clusters) a partir de los datos almacenados.
                </p>

                {error && (
                    <div className="alert alert-danger shadow-sm border-0" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                )}

                <div className="d-flex gap-2 flex-wrap">
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={loadingMeta}
                    >
                        {loadingMeta ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Generando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-cpu-fill me-2"></i>
                                Generar reporte (meta + mapas)
                            </>
                        )}
                    </button>

                    <button
                        className="btn btn-success"
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
                                Descargar Excel
                            </>
                        )}
                    </button>

                    {reportId && (
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setReportId(null);
                                setSummary(null);
                                setError(null);
                            }}
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Limpiar
                        </button>
                    )}
                </div>

                {summary && (
                    <div className="mt-4">
                        <h6 className="mb-2">Resumen</h6>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <div className="p-3 border rounded bg-light">
                                    <div className="text-muted">Report ID</div>
                                    <div className="fw-bold">{summary.reportId}</div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="p-3 border rounded bg-light">
                                    <div className="text-muted">Puntos</div>
                                    <div className="fw-bold">{summary.points}</div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="p-3 border rounded bg-light">
                                    <div className="text-muted">Usuarios</div>
                                    <div className="fw-bold">{summary.users}</div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="p-3 border rounded bg-light">
                                    <div className="text-muted">Clusters globales</div>
                                    <div className="fw-bold">{summary.clustersGlobal}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {reportId && (
                <div className="row g-4">
                    <div className="col-12 col-xl-6">
                        <div className="card-modern border-0 p-3">
                            <h5 className="mb-3">
                                <i className="bi bi-thermometer-sun me-2"></i>
                                Heatmap
                            </h5>
                            <iframe
                                title="heatmap"
                                src={heatmapUrl}
                                style={{ width: '100%', height: 600, border: 0, borderRadius: 12 }}
                            />
                            <div className="mt-2">
                                <a className="btn btn-link p-0" href={heatmapUrl} target="_blank" rel="noreferrer">
                                    Abrir en nueva pestaña
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-xl-6">
                        <div className="card-modern border-0 p-3">
                            <h5 className="mb-3">
                                <i className="bi bi-diagram-3-fill me-2"></i>
                                Clusters globales
                            </h5>
                            <iframe
                                title="clusters"
                                src={clustersUrl}
                                style={{ width: '100%', height: 600, border: 0, borderRadius: 12 }}
                            />
                            <div className="mt-2">
                                <a className="btn btn-link p-0" href={clustersUrl} target="_blank" rel="noreferrer">
                                    Abrir en nueva pestaña
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataScience;