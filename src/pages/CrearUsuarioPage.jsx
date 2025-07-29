import React, { useState, useEffect } from 'react'; // Importa useEffect
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap'; // Importa Spinner
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const CrearUsuarioPage = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('ROL_COLABORADOR');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { authToken, isAuthLoading, role } = useAuth(); // Obtén isAuthLoading y role del contexto

  // Efecto para depurar el authToken cuando cambia
  useEffect(() => {
    console.log("Estado de autenticación actualizado:");
    console.log("  authToken:", authToken ? "Token cargado" : "Token NO cargado/undefined");
    console.log("  isAuthLoading:", isAuthLoading);
    console.log("  role:", role);
  }, [authToken, isAuthLoading, role]); // Se ejecuta cuando estas variables cambian

  // Protección de ruta a nivel de UI: Asegúrate de que solo ROL_ADMIN pueda ver esto
  if (isAuthLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando autenticación...</span>
        </Spinner>
      </Container>
    );
  }

  // Verifica el rol una vez que la autenticación haya terminado de cargar
  // Esto previene que un COLABORADOR intente acceder a la página
  if (role !== 'ROL_ADMIN') {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center">
          Acceso denegado. Solo los administradores pueden crear usuarios.
        </Alert>
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Asegúrate de que el token esté presente ANTES de hacer la llamada
    if (!authToken) {
      setError("No estás autenticado o tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}` 
        }
      };

      const response = await axios.post('https://gateway-production-129e.up.railway.app/api/users', 
        {
          nombreUsuario,
          clave,
          nombre,
          email,
          rol
        },
        config 
      );

      if (response.status === 200 || response.status === 201) { // 201 Created es una respuesta común para POST
        setSuccess(true);
        setNombreUsuario('');
        setClave('');
        setNombre('');
        setEmail('');
        setRol('ROL_COLABORADOR'); 
        // Opcional: redirigir después de un tiempo
         setTimeout(() => navigate('/admin/dashboard'), 2000); 
      }
    } catch (err) {
      console.error('Error al crear usuario:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Hubo un error al crear el usuario. Asegúrate de tener los permisos adecuados y que los datos sean válidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm">
        <Card.Body>
          <h1 className="text-center mb-4">Crear Nuevo Usuario</h1>

          {success && <Alert variant="success" className="text-center">¡Usuario creado con éxito!</Alert>}
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formNombreUsuario">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el nombre de usuario"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                required
              />
            </Form.Group>

  <Form.Group className="mb-3 position-relative" controlId="formClave">
        <Form.Label>Clave</Form.Label>
        <InputGroup>
          <Form.Control
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingresa la clave"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? '🔒' : '🔑'}
          </Button>
        </InputGroup>
      </Form.Group>

            <Form.Group className="mb-3" controlId="formNombre">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa el correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formRol">
              <Form.Label>Rol</Form.Label>
              <Form.Select value={rol} onChange={(e) => setRol(e.target.value)} required>
                <option value="ROL_COLABORADOR">Creador</option>
                <option value="ROL_ADMIN">Administrador</option>
              </Form.Select>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CrearUsuarioPage;