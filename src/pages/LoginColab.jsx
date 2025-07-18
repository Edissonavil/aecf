// src/pages/LoginColab.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginColab = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  // Cambiamos los emojis aquí
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRole = await login(username, password);

      if (!['ROL_ADMIN', 'ROL_COLABORADOR'].includes(userRole)) {
        alert('Acceso exclusivo para Creadores AEC.');
        logout();
        return;
      }

      if (userRole === 'ROL_ADMIN') {
        navigate('/admin/revisar-productos');
      } else {
        navigate('/cargarProducto');
      }
    } catch (err) {
      console.error(err);
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-wrapper font-inter">
      <div className="login-card">
        <div className="login-card__inner">
        <div className="login-header">
          <h1 className="login-title">AEC<span className="text-fuchsia-electric">Block</span></h1>
          <p className="login-subtitle">Bienvenido Creador AEC</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              required
            />
          </div>
          <div className="position-relative"> {/* Asegúrate de que este div tiene position-relative */}
            <label htmlFor="password">Contraseña</label>
              <div className="input-with-toggle position-relative">
    <input
      type={showPassword ? 'text' : 'password'}
      id="password"
      name="password"
      autoComplete="current-password"
      value={password}
      onChange={e => setPassword(e.target.value)}
      placeholder="Ingresa tu contraseña"
      required
    />
    <button
      type="button"
      onClick={() => setShowPassword(prev => !prev)}
      className="password-toggle-btn"
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPassword ? '🔒' : '🔑'}
    </button>
  </div>
          </div>

          <button type="submit" className="btn-login">Iniciar Sesión</button>
          <div className="login-links">
            <Link to="/resetearClave" className="login-link">
              ¿Olvidaste tu contraseña?
            </Link>
            <p>
              ¿No tienes una cuenta?{' '}
              <Link to="/solicitudCreador" className="register-link">
                Solicita ser un Creador Aec aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default LoginColab;


