// src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react'; // Removed useRef, useEffect
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify'; 



const LoginPage = () => {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, logout } = useContext(AuthContext);
  const navigate          = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const userRole = await login(username, password);
      if (userRole !== 'ROL_CLIENTE') {
        toast.error('Este acceso es exclusivo para clientes.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        logout(); // Ensure they are logged out if they tried to log in as a non-client here
        return;
      }
      navigate('/');
      toast.success('¡Bienvenido de nuevo!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      });
    } catch (error) {
      console.error("Login error:", error); // Log the error for debugging
      toast.error('Credenciales incorrectas. Intenta de nuevo.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      });
    }
  };

  return (
    <div className="login-wrapper font-inter">
      <div className="login-card">
          <div className="login-card__inner">
        <div className="login-header">
          <h1 className="login-title">
            AEC<span className="text-fuchsia-electric">Block</span>
          </h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              required
            />
          </div>

          <div className="form-group position-relative">
            <label htmlFor="password" >Contraseña</label>
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

          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>

          <div className="login-links">
          <Link to="/resetearClave" className="login-link">
              ¿Olvidaste tu contraseña?
            </Link>
            <p>
              ¿No tienes una cuenta?{' '}
              <Link to="/registro" className="register-link">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
        <div className="login-card2">
        <div className="login-card__inner">
        <Link to="/login-colaborador">
          <button className="btn-colaborador">
            ¿Eres CREADOR AEC?
          </button>
        </Link>
      </div>
      </div>
      </div>
  
  );
};

export default LoginPage;