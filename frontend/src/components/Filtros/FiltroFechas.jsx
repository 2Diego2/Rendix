import React, { useState, useEffect } from 'react';
import './FiltroFechas.css'; // Asumimos que crearemos un CSS para estilos específicos si es necesario

/**
 * Componente reutilizable para filtrar por fechas.
 * Ofrece preajustes (Hoy, Ayer, Semana, Mes) y selección de rango personalizado.
 * 
 * @param {Function} onFiltrar - Callback que recibe (fechaInicio, fechaFin) cuando se aplica un filtro.
 * @param {Function} onLimpiar - Callback para resetear los filtros.
 */
const FiltroFechas = ({ onFiltrar, onLimpiar }) => {
    // Estado para el rango personalizado
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    // Estado para saber qué botón de filtro está activo (para estilos)
    const [filtroActivo, setFiltroActivo] = useState('');

    // Función auxiliar para formatear fecha a YYYY-MM-DD (local)
    const formatearFecha = (fecha) => {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Manejadores de preajustes
    const aplicarFiltroHoy = () => {
        const hoy = new Date();
        const fechaStr = formatearFecha(hoy);
        setFiltroActivo('hoy');
        setFechaInicio(fechaStr);
        setFechaFin(fechaStr);
        onFiltrar(fechaStr, fechaStr);
    };

    const aplicarFiltroAyer = () => {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const fechaStr = formatearFecha(ayer);
        setFiltroActivo('ayer');
        setFechaInicio(fechaStr);
        setFechaFin(fechaStr);
        onFiltrar(fechaStr, fechaStr);
    };

    const aplicarFiltroEstaSemana = () => {
        const hoy = new Date();
        const primerDia = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 1)); // Lunes
        const ultimoDia = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 7)); // Domingo

        const inicioStr = formatearFecha(primerDia);
        const finStr = formatearFecha(ultimoDia);

        setFiltroActivo('semana');
        setFechaInicio(inicioStr);
        setFechaFin(finStr);
        onFiltrar(inicioStr, finStr);
    };

    const aplicarFiltroEsteMes = () => {
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        const inicioStr = formatearFecha(primerDia);
        const finStr = formatearFecha(ultimoDia);

        setFiltroActivo('mes');
        setFechaInicio(inicioStr);
        setFechaFin(finStr);
        onFiltrar(inicioStr, finStr);
    };

    // Manejador para rango personalizado
    const aplicarRangoPersonalizado = () => {
        if (fechaInicio && fechaFin) {
            let inicio = fechaInicio;
            let fin = fechaFin;

            // Validar que fechaInicio no sea mayor que fechaFin
            if (new Date(inicio) > new Date(fin)) {
                // Intercambiar fechas si están invertidas
                const temp = inicio;
                inicio = fin;
                fin = temp;

                // Actualizar estado visual
                setFechaInicio(inicio);
                setFechaFin(fin);
            }

            setFiltroActivo('custom');
            onFiltrar(inicio, fin);
        }
    };

    // Manejador para limpiar filtros
    const limpiarFiltros = () => {
        setFiltroActivo('');
        setFechaInicio('');
        setFechaFin('');
        onLimpiar();
    };

    return (
        <div className="filtro-fechas-container card" style={{ padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ margin: 0 }}>Filtrar por Fecha</h4>

                {/* Botones de Preajuste */}
                <div className="botones-filtro" style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={`btn-filtro ${filtroActivo === 'hoy' ? 'activo' : ''}`}
                        onClick={aplicarFiltroHoy}
                    >
                        Hoy
                    </button>
                    <button
                        className={`btn-filtro ${filtroActivo === 'ayer' ? 'activo' : ''}`}
                        onClick={aplicarFiltroAyer}
                    >
                        Ayer
                    </button>
                    <button
                        className={`btn-filtro ${filtroActivo === 'semana' ? 'activo' : ''}`}
                        onClick={aplicarFiltroEstaSemana}
                    >
                        Esta Semana
                    </button>
                    <button
                        className={`btn-filtro ${filtroActivo === 'mes' ? 'activo' : ''}`}
                        onClick={aplicarFiltroEsteMes}
                    >
                        Este Mes
                    </button>
                </div>
            </div>

            {/* Selector de Rango Personalizado */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Desde:</span>
                    <input
                        type="date"
                        className="input-field"
                        value={fechaInicio}
                        onChange={(e) => {
                            setFechaInicio(e.target.value);
                            setFiltroActivo('custom'); // Cambiar a custom si edita manualmente
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Hasta:</span>
                    <input
                        type="date"
                        className="input-field"
                        value={fechaFin}
                        onChange={(e) => {
                            setFechaFin(e.target.value);
                            setFiltroActivo('custom');
                        }}
                    />
                </div>

                <button
                    className="btn btn-primary"
                    onClick={aplicarRangoPersonalizado}
                    disabled={!fechaInicio || !fechaFin}
                >
                    Aplicar Rango
                </button>

                {(filtroActivo || fechaInicio || fechaFin) && (
                    <button
                        className="btn btn-outline"
                        onClick={limpiarFiltros}
                        style={{ marginLeft: 'auto' }}
                    >
                        Limpiar Filtros
                    </button>
                )}
            </div>
        </div>
    );
};

export default FiltroFechas;
