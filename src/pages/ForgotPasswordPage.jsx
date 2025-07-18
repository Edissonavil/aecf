// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as userApi from '../services/userApi'; // Asegúrate de que tienes esta API
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Llama a una nueva función en userApi para solicitar el reseteo
      await userApi.requestPasswordReset(username);
      setMessage('Si el nombre de usuario es correcto, un administrador ha sido notificado para resetear su contraseña. Se le contactará con las instrucciones.');
      toast.success('Solicitud enviada. ¡Revisa tu correo!');
      setUsername(''); // Limpiar el campo
    } catch (err) {
      console.error("Error al solicitar reseteo de contraseña:", err);
      // No revelemos si el usuario existe o no por seguridad
      setError('Ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
      toast.error('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: '450px', width: '100%' }}>
        <Card.Body>
          <h2 className="text-center mb-4">¿Olvidaste tu Contraseña?</h2>
          <p className="text-center text-muted mb-4">Ingresa tu nombre de usuario y te ayudaremos.</p>

          {message && <Alert variant="success" className="text-center">{message}</Alert>}
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading || message} // Deshabilita si está cargando o ya hay mensaje de éxito
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading || message}
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Solicitar Reseteo'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Button variant="link" onClick={() => navigate('/login')}>Volver al Login</Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPasswordPage;