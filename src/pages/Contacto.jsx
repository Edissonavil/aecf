// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../styles/SolicitudCreadorPage.css'; // Reutilizamos el mismo archivo de estilos

const ContactPage = () => {
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Estados para la interfaz de usuario
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Define la URL del Gateway para el nuevo endpoint de contacto
      // Asegúrate de que esta URL coincida con el endpoint de tu backend
      const GATEWAY_CONTACT_URL = 'https://gateway-production-129e.up.railway.app/api/contact'; 

      // Envía la solicitud al backend a través del Gateway
      const response = await axios.post(GATEWAY_CONTACT_URL, {
        nombre,
        email,
        asunto,
        mensaje,
      });

      if (response.status === 200) {
        setSuccess(true);
        // Opcional: limpiar el formulario después de enviar
        setNombre('');
        setEmail('');
        setAsunto('');
        setMensaje('');
        // Opcional: Redirigir o mostrar un mensaje de éxito por más tiempo
      }
    } catch (err) {
      console.error('Error al enviar el mensaje de contacto:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Hubo un error al enviar tu mensaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="solicitud-creador-container">
      <Card className="solicitud-creador-card shadow-lg">
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="solicitud-title">Contáctanos <span className="text-fuchsia-electric">AEC</span></h2>
            <p className="text-muted">
              Por favor, completa el siguiente formulario para enviarnos un mensaje.
            </p>
          </div>

          {success && <Alert variant="success" className="text-center">¡Mensaje enviado con éxito! Te responderemos pronto.</Alert>}
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formNombre">
              <Form.Label>Nombres Completos</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tus nombres y apellidos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAsunto">
              <Form.Label>Asunto</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. Soporte, Consulta, Sugerencia"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMensaje">
              <Form.Label>Mensaje</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Escribe tu mensaje aquí..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 btn-solicitar"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ContactPage;