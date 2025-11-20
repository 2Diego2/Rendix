import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { validarVendedoraFrontend } from '../utils/validators'

// Componente minimal para gestionar vendedoras (lista, crear, editar, eliminar)
export function Vendedoras() {
  const [vendedoras, setVendedoras] = useState([])
  const [cargando, setCargando] = useState(false)

  // Form nuevo / editar
  const [editandoId, setEditandoId] = useState(null)
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [sueldoBase, setSueldoBase] = useState('')
  const [porcentaje, setPorcentaje] = useState('')

  // Cargar vendedoras desde backend
  useEffect(() => {
    cargarVendedoras()
  }, [])

  async function cargarVendedoras() {
    setCargando(true)
    try {
      const res = await api.get('/vendedoras')
      setVendedoras(res.data.vendedoras || [])
    } catch (e) {
      console.error('Error cargando vendedoras', e)
      alert('Error al cargar vendedoras')
    } finally {
      setCargando(false)
    }
  }

  // Preparar formulario para editar
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

  // Crear o actualizar vendedora
  async function guardar(e) {
    e.preventDefault()
    // Validaciones en frontend con mensajes claros
    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim() || undefined,
      sueldo_base: sueldoBase ? Number(sueldoBase) : 0,
      porcentaje_comision: porcentaje ? Number(porcentaje) : 0,
    }
    const valid = validarVendedoraFrontend(payload)
    if (!valid.valid) {
      return alert('Errores: ' + valid.errors.join('; '))
    }

    try {
      if (editandoId) {
        await api.put(`/vendedoras/${editandoId}`, payload)
        alert('Vendedora actualizada')
      } else {
        await api.post('/vendedoras', payload)
        alert('Vendedora creada')
      }
      limpiarFormulario()
      cargarVendedoras()
    } catch (err) {
      console.error('Error guardando vendedora', err)
      alert(err?.response?.data?.error || 'Error al guardar')
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar vendedora? Esta acción no se puede deshacer')) return
    try {
      await api.delete(`/vendedoras/${id}`)
      alert('Vendedora eliminada')
      cargarVendedoras()
    } catch (err) {
      console.error('Error eliminando vendedora', err)
      alert(err?.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <div>
      <h2>Gestión de Vendedoras</h2>
      <div>
        <form onSubmit={guardar} style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input placeholder="Código (opcional)" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          <input placeholder="Sueldo base" type="number" value={sueldoBase} onChange={(e) => setSueldoBase(e.target.value)} style={{ width: '120px' }} />
          <input placeholder="% comisión" type="number" value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)} style={{ width: '120px' }} />
          <button type="submit">{editandoId ? 'Actualizar' : 'Crear'}</button>
          {editandoId && <button type="button" onClick={limpiarFormulario}>Cancelar</button>}
        </form>
      </div>

      <div>
        {cargando ? <div>Cargando...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Sueldo base</th>
                <th>% Comisión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vendedoras.map(v => (
                <tr key={v.id}>
                  <td>{v.nombre}</td>
                  <td>{v.codigo}</td>
                  <td>{Number(v.sueldo_base || 0).toFixed(2)}</td>
                  <td>{Number(v.porcentaje_comision || 0).toFixed(2)}</td>
                  <td>
                    <button onClick={() => iniciarEdicion(v)}>Editar</button>
                    <button onClick={() => eliminar(v.id)} style={{ marginLeft: '8px' }}>Eliminar</button>
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
