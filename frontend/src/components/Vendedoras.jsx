import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { validarVendedoraFrontend } from '../utils/validators'

// Estilos generales tipo dashboard - usando variables CSS para dark theme
const card = {
  background: "var(--card)",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  marginBottom: "20px",
  width: "100%",
}

const inputStyle = {
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  outline: "none",
  fontSize: "14px",
  width: "100%",
  background: "var(--card)",
  color: "var(--foreground)",
}

const buttonPrimary = {
  padding: "12px 18px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
}

const buttonSecondary = {
  padding: "12px 18px",
  background: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
}

const buttonDanger = {
  padding: "10px 14px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 600,
}

export function Vendedoras() {
  const [vendedoras, setVendedoras] = useState([])
  const [cargando, setCargando] = useState(false)

  const [editandoId, setEditandoId] = useState(null)
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [sueldoBase, setSueldoBase] = useState('')
  const [porcentaje, setPorcentaje] = useState('')

  useEffect(() => {
    cargarVendedoras()
  }, [])

  async function cargarVendedoras() {
    setCargando(true)
    try {
      const res = await api.get('/vendedoras')
      setVendedoras(res.data.vendedoras || [])
    } finally {
      setCargando(false)
    }
  }

  function iniciarEdicion(v) {
    setEditandoId(v.id)
    setNombre(v.nombre || '')
    setCodigo(v.codigo || '')
    setSueldoBase(String(v.sueldo_base || ''))
    setPorcentaje(String(v.porcentaje_comision || ''))
  }

  function limpiarFormulario() {
    setEditandoId(null)
    setNombre('')
    setCodigo('')
    setSueldoBase('')
    setPorcentaje('')
  }

  async function guardar(e) {
    e.preventDefault()
    // Validaciones en frontend con mensajes claros
    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim() || undefined,
      sueldo_base: Number(sueldoBase) || 0,
      porcentaje_comision: Number(porcentaje) || 0
    }
    const valid = validarVendedoraFrontend(payload)
    if (!valid.valid) {
      return alert('Errores: ' + valid.errors.join('; '))
    }

    try {
      if (editandoId) {
        await api.put(`/vendedoras/${editandoId}`, payload)
      } else {
        await api.post('/vendedoras', payload)
      }
      limpiarFormulario()
      cargarVendedoras()
    } catch {
      alert("Error al guardar")
    }
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar vendedora?")) return
    try {
      await api.delete(`/vendedoras/${id}`)
      cargarVendedoras()
    } catch (err) {
      const mensaje = err.response?.data?.error || "Error al eliminar"
      // Si el error es específico de ventas del mes corriente, mostrar mensaje personalizado
      if (err.response?.status === 400 && mensaje.includes('corriente mes')) {
        alert("Esta vendedora no puede ser eliminada porque tiene una venta registrada en el corriente mes")
      } else {
        alert(mensaje)
      }
    }
  }

  return (
    <div style={{ width: "100%", padding: "0 20px" }}>

      <h2 style={{ marginBottom: "20px", color: "var(--foreground)" }}>Gestión de Vendedoras</h2>

      {/* FORMULARIO FULL WIDTH */}
      <div style={card}>
        <form onSubmit={guardar}>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "20px"
          }}>
            <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
            <input placeholder="Código (opcional)" value={codigo} onChange={(e) => setCodigo(e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Sueldo base" value={sueldoBase} onChange={(e) => setSueldoBase(e.target.value)} style={inputStyle} />
            <input type="number" placeholder="% comisión" value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" style={buttonPrimary}>
              {editandoId ? "Actualizar" : "Crear nueva vendedora"}
            </button>

            {editandoId && (
              <button type="button" onClick={limpiarFormulario} style={buttonSecondary}>
                Cancelar
              </button>
            )}
          </div>

        </form>
      </div>

      {/* TABLA FULL WIDTH */}
      <div style={card}>
        {cargando ? (
          <div>Cargando...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                <th style={{ padding: "14px", textAlign: "left", color: "var(--foreground)" }}>Nombre</th>
                <th style={{ padding: "14px", textAlign: "left", color: "var(--foreground)" }}>Código</th>
                <th style={{ padding: "14px", textAlign: "left", color: "var(--foreground)" }}>Sueldo base</th>
                <th style={{ padding: "14px", textAlign: "left", color: "var(--foreground)" }}>% Comisión</th>
                <th style={{ padding: "14px", textAlign: "center", color: "var(--foreground)" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {vendedoras.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px", color: "var(--foreground)" }}>{v.nombre}</td>
                  <td style={{ padding: "14px", color: "var(--foreground)" }}>{v.codigo}</td>
                  <td style={{ padding: "14px", color: "var(--foreground)" }}>${Number(v.sueldo_base).toFixed(2)}</td>
                  <td style={{ padding: "14px", color: "var(--foreground)" }}>{Number(v.porcentaje_comision).toFixed(2)}%</td>

                  <td style={{ padding: "14px", textAlign: "center" }}>
                    <button
                      onClick={() => iniciarEdicion(v)}
                      style={{ ...buttonPrimary, padding: "8px 12px", fontSize: "13px" }}>
                      Editar
                    </button>

                    <button
                      onClick={() => eliminar(v.id)}
                      style={{ ...buttonDanger, padding: "8px 12px", fontSize: "13px", marginLeft: "10px" }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

    </div>
  )
}

export default Vendedoras
