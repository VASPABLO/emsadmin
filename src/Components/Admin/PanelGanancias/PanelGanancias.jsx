import React, { useEffect, useMemo, useState } from 'react';
import baseURL from '../../url';
import apiFetch from '../../apiFetch';
import moneda from '../../moneda';
import './PanelGanancias.css';

const formatoMoneda = (valor) =>
    `${moneda} ${Number(valor || 0).toLocaleString('es-CR', { maximumFractionDigits: 0 })}`;

const formatoFechaCorta = (isoDate) => {
    const [, mes, dia] = isoDate.split('-');
    return `${dia}/${mes}`;
};

export default function PanelGanancias() {
    const [semanas, setSemanas] = useState([]);
    const [semanaActual, setSemanaActual] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoverIndex, setHoverIndex] = useState(null);

    useEffect(() => {
        apiFetch(`${baseURL}/reportes/gananciasGet.php`, { method: 'GET' })
            .then((r) => r.json())
            .then((data) => {
                setSemanas(data.semanas || []);
                setSemanaActual(data.semanaActual || null);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error al cargar ganancias:', error);
                setLoading(false);
            });
    }, []);

    const maxGanancia = useMemo(
        () => Math.max(1, ...semanas.map((s) => s.ganancia)),
        [semanas]
    );

    const chartHeight = 160;
    const barWidth = 28;
    const gap = 14;
    const topPad = 24;

    return (
        <section className='panelGanancias'>
            <div className='panelGanancias__header'>
                <div>
                    <h3>Ganancias</h3>
                    <p>Ventas internas facturadas, costo capturado al momento de facturar.</p>
                </div>
            </div>

            {loading ? (
                <p className='panelGanancias__cargando'>Cargando...</p>
            ) : (
                <>
                    <div className='panelGanancias__resumen'>
                        <div className='panelGanancias__statPrincipal'>
                            <span>Ganancia de esta semana</span>
                            <strong>{formatoMoneda(semanaActual?.ganancia)}</strong>
                        </div>
                        <div className='panelGanancias__statSecundario'>
                            <span>Ventas</span>
                            <strong>{formatoMoneda(semanaActual?.ventas)}</strong>
                        </div>
                        <div className='panelGanancias__statSecundario'>
                            <span>Costo</span>
                            <strong>{formatoMoneda(semanaActual?.costo)}</strong>
                        </div>
                        <div className='panelGanancias__statSecundario'>
                            <span>Pedidos facturados</span>
                            <strong>{semanaActual?.pedidos ?? 0}</strong>
                        </div>
                    </div>

                    {semanas.length === 0 ? (
                        <p className='panelGanancias__vacio'>
                            Todavía no hay pedidos internos facturados para mostrar en el gráfico.
                        </p>
                    ) : (
                        <div className='panelGanancias__chartWrap'>
                            <svg
                                className='panelGanancias__chart'
                                width={semanas.length * (barWidth + gap)}
                                height={chartHeight + topPad + 30}
                                role='img'
                                aria-label='Ganancia por semana, últimas semanas facturadas'
                            >
                                {[0, 0.5, 1].map((frac) => (
                                    <line
                                        key={frac}
                                        x1={0}
                                        x2={semanas.length * (barWidth + gap)}
                                        y1={chartHeight - chartHeight * frac + topPad}
                                        y2={chartHeight - chartHeight * frac + topPad}
                                        stroke='#e2e8f0'
                                        strokeWidth={1}
                                    />
                                ))}

                                {semanas.map((semana, index) => {
                                    const alturaBarra = Math.max(
                                        2,
                                        (semana.ganancia / maxGanancia) * chartHeight
                                    );
                                    const x = index * (barWidth + gap);
                                    const y = chartHeight - alturaBarra + topPad;
                                    const esUltima = index === semanas.length - 1;
                                    const activa = hoverIndex === index;

                                    return (
                                        <g
                                            key={semana.inicio}
                                            onMouseEnter={() => setHoverIndex(index)}
                                            onMouseLeave={() => setHoverIndex(null)}
                                            onFocus={() => setHoverIndex(index)}
                                            onBlur={() => setHoverIndex(null)}
                                            tabIndex={0}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <rect
                                                x={x}
                                                y={y}
                                                width={barWidth}
                                                height={alturaBarra}
                                                rx={4}
                                                fill='#15803d'
                                                opacity={activa ? 1 : 0.82}
                                            />
                                            {(esUltima || activa) && (
                                                <text
                                                    x={x + barWidth / 2}
                                                    y={y - 6}
                                                    textAnchor='middle'
                                                    fontSize='11'
                                                    fontWeight='700'
                                                    fill='#0f172a'
                                                >
                                                    {formatoMoneda(semana.ganancia)}
                                                </text>
                                            )}
                                            <text
                                                x={x + barWidth / 2}
                                                y={chartHeight + topPad + 20}
                                                textAnchor='middle'
                                                fontSize='11'
                                                fill='#64748b'
                                            >
                                                {formatoFechaCorta(semana.inicio)}
                                            </text>

                                            {activa && (
                                                <foreignObject
                                                    x={Math.max(0, x - 50)}
                                                    y={Math.max(0, y - 62)}
                                                    width='140'
                                                    height='52'
                                                >
                                                    <div className='panelGanancias__tooltip'>
                                                        <strong>{formatoMoneda(semana.ganancia)}</strong>
                                                        <span>{semana.pedidos} pedido(s)</span>
                                                    </div>
                                                </foreignObject>
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
