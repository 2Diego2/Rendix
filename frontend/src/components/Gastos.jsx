import React, { useState, useEffect } from "react";
import api from '../utils/api';

export function Gastos() {
  const [gastos, setGastos] = useState([]);

  // Formulario para nuevo gasto
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoMonto, setNuevoMonto] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Adicional');

  // Cargar gastos al montar
  useEffect(() => {
    api.get('/gastos/hoy')
      .then(res => setGastos(res.data.gastosHoy || []))
      .catch(() => console.log("No se pudieron cargar los gastos."));
  }, []);

  // Crear un nuevo gasto
    const handleCrearGasto = (e) => {
      e.preventDefault();
      if (!nuevoMonto || Number(nuevoMonto) <= 0) return alert('Ingrese un monto válido');

      api.post('/gastos', {
        monto: Number(nuevoMonto),
        detalle: nuevaDescripcion || nuevoNombre || "Sin detalle",
      })
        .then(() => {
          // Volver a cargar los gastos del día después de crear uno nuevo
          return api.get('/gastos/hoy');
        })
        .then(res => {
          setGastos(res.data.gastosHoy || []);
          setNuevoNombre('');
          setNuevaDescripcion('');
          setNuevoMonto('');
          setNuevaCategoria('Adicional');
        })
        .catch(err => {
          console.error('Error al crear gasto:', err);
          alert('Error al crear gasto');
        });
    };

  // Eliminar gasto
  const handleEliminar = (id) => {
    if (!confirm('¿Seguro que querés eliminar este gasto?')) return;
    api.delete(`/gastos/${id}`)
      .then(() => setGastos(gastos.filter(g => g.id !== id)))
      .catch(err => {
        console.error('Error al eliminar gasto:', err);
        alert('Error al eliminar gasto');
      });
  };

  // Editar gasto (simple: modifica monto y descripción)
  const handleEditar = (id) => {
    const gasto = gastos.find(g => g.id === id);
    const nuevoMonto = prompt('Nuevo monto:', gasto.monto);
    const nuevaDescripcion = prompt('Nueva descripción:', gasto.descripcion);
    if (nuevoMonto === null || nuevaDescripcion === null) return;

    api.put(`/gastos/${id}`, {
      monto: Number(nuevoMonto),
      descripcion: nuevaDescripcion,
    })
      .then(res => {
        setGastos(gastos.map(g => g.id === id ? { ...g, monto: Number(nuevoMonto), descripcion: nuevaDescripcion } : g));
      })
      .catch(err => {
        console.error('Error al editar gasto:', err);
        alert('Error al editar gasto');
      });
  };

  const descargarExcel = () => {
    fetch("http://localhost:3001/gastos/exportar/excel")
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gastos.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="dashboard-content">

      {/* Formulario para crear gasto */}
      <div className="card" style={{ marginBottom: "20px", padding: "16px" }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <form
            onSubmit={handleCrearGasto}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Nombre"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                width: "150px",
              }}
            />

            <input
              type="text"
              placeholder="Descripción"
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                width: "220px",
              }}
            />

            <input
              type="number"
              placeholder="Monto"
              value={nuevoMonto}
              onChange={(e) => setNuevoMonto(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                width: "110px",
              }}
            />

            <select
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                width: "130px",
                background: "white",
              }}
            >
              <option>Adicional</option>
              <option>Fijo</option>
              <option>Variable</option>
            </select>

            <button
              type="submit"
              style={{
                padding: "8px 14px",
                backgroundColor: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Agregar gasto
            </button>
          </form>

          <button
            onClick={descargarExcel}
            style={{
              padding: "8px 14px",
              backgroundColor: "#16A34A", // verde éxito
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabla de gastos */}
      <div className="card" style={{ padding: "12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Nombre</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Descripción</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Monto</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Fecha</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Categoría</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px" }}>{gasto.concepto}</td>
                <td style={{ padding: "12px" }}>{gasto.descripcion}</td>
                <td style={{ padding: "12px", color: "var(--chart-1)", fontWeight: "600" }}>
                  ${Number(gasto.monto || 0).toFixed(2)}
                </td>
                <td style={{ padding: "12px" }}>{gasto.fecha}</td>
                <td style={{ padding: "12px" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor:
                        gasto.categoria === "Fijo" ? "var(--chart-2)" :
                        gasto.categoria === "Variable" ? "var(--chart-3)" :
                        "var(--chart-4)",
                      color: "white",
                    }}
                  >
                    {gasto.categoria}
                  </span>
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button onClick={() => handleEditar(gasto.id)} style={{ marginRight: '6px' }}>Editar</button>
                  <button onClick={() => handleEliminar(gasto.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
