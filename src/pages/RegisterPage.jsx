// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/userService';
import '../styles/RegisterPage.css';
import '../styles/LoginPage.css';

const RegisterPage = () => {
  const [form, setForm] = useState({
    nombreUsuario: '',
    nombre: '',
    email: '',
    clave: '',
    aceptarTerminos: false,
  });

  const [errors, setErrors] = useState({ clave: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = { clave: '' };
    let valid = true;
    if (form.clave.length < 8) {
      newErrors.clave = 'La contraseña debe tener al menos 8 caracteres.';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.aceptarTerminos) {
      alert('Debes aceptar los Términos y Condiciones para registrarte.');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const resp = await registerUser({
        nombreUsuario: form.nombreUsuario,
        nombre: form.nombre,
        email: form.email,
        clave: form.clave,
      });
      console.log('Backend respondió:', resp);
      alert('¡Registro exitoso! Ya puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      console.error('Error al registrar usuario:', err.response || err.message);
      alert(err.response?.data?.message || 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper font-inter">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">
            AEC<span className="text-fuchsia-electric">Block</span>
          </h1>
          <p className="register-subtitle">Crea tu cuenta y compra con nosotros.</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Usuario */}
          <div className="form-group">
            <label htmlFor="nombreUsuario">Nombre de Usuario</label>
            <input
              id="nombreUsuario"
              name="nombreUsuario"
              type="text"
              className="form-control"
              value={form.nombreUsuario}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="ej. Juan.Perez123"
            />
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">Nombres Completos</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="form-control"
              value={form.nombre}
              onChange={handleChange}
              required
              autoComplete="given-name"
              placeholder="ej. Juan Carlos Perez G"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="tu@ejemplo.com"
            />
          </div>

          {/* Contraseña */}
          <div className="form-group position-relative">
            <label htmlFor="clave">Contraseña</label>
            <div className="input-with-toggle position-relative">
              <input
                id="clave"
                name="clave"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={form.clave}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="**********"
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
            {errors.clave && <p className="error-text">{errors.clave}</p>}
          </div>

          {/* Términos */}
          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="aceptarTerminos"
              name="aceptarTerminos"
              className="custom-checkbox-input"
              checked={form.aceptarTerminos}
              onChange={handleChange}
              required
            />
            <label htmlFor="aceptarTerminos" className="custom-checkbox-label">
              <span className="custom-checkbox-circle"></span>
              Acepto los{' '}
              <Link to="/terms" className="link-text">
                Términos y Condiciones
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="btn-register"
            disabled={loading}
          >
            {loading ? 'Registrando…' : 'Registrarse'}
          </button>

          <div className="register-links">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="link-text-yellow">
                Inicia Sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
