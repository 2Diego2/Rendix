import React, { useState } from 'react';
import api from '../utils/api';

export default function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Maneja el submit del formulario de login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const respuesta = await api.post('/auth/login', { email, password });
      const { token, usuario } = respuesta.data;
      // Guardar token en localStorage y notificar al padre
      localStorage.setItem('token', token);
      if (typeof onLoginExitoso === 'function') onLoginExitoso(usuario);
    } catch (err) {
      console.error('Error en login:', err);
      // Si el backend devuelve 401 o mensaje claro, mostramos mensaje al usuario
      const mensaje = err?.response?.data?.error || 'Error iniciando sesión. Revisa tus credenciales.';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2>
        {error && <div className="login-error">{error}</div>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
