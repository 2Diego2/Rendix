import React, { useState } from 'react';
import api from '../utils/api';
import { validarLoginFrontend } from '../utils/validators';
import './Css/Login.css';

export default function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validación frontend
    const check = validarLoginFrontend({ email, password });
    if (!check.valid) {
      setError(check.errors.join('; '));
      setLoading(false);
      return;
    }

    try {
      const respuesta = await api.post('/auth/login', { email, password });

      // Desestructuramos la respuesta
      const { token, usuario } = respuesta.data;

      // 1. Guardar token
      localStorage.setItem('token', token);

      // 2. Guardamos el objeto usuario completo
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // 3. Notificar al padre (App.jsx) para que cambie la pantalla
      if (typeof onLoginExitoso === 'function') {
        onLoginExitoso(usuario);
      } else {
        // Fallback si no hay función: recargar la página para ir al Home
        window.location.href = '/';
      }

    } catch (err) {
      console.error('Error en login:', err);
      const mensaje = err?.response?.data?.error || 'Error iniciando sesión. Revisa tus credenciales.';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Bienvenido a Rendix</h2>
          <p>Inicia sesión para gestionar tu negocio</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="input-control"
              placeholder="ejemplo@rendix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}