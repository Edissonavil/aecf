import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../styles/SolicitudCreadorPage.css';

const SolicitudCreadorPage = () => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  // Nuevo estado para el campo "hablanosDeTi"
  const [hablanosDeTi, setHablanosDeTi] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!aceptaTerminos) {
      setError('Debes aceptar los Términos y Condiciones para continuar.');
      setLoading(false);
      return;
    }

    try {
      // Envía la solicitud al nuevo endpoint del backend
      const response = await axios.post('http://localhost:8081/api/solicitud-creador', 
        {  
        nombreCompleto,
        username,
        email,
        // Incluye el nuevo campo en la solicitud
        hablanosDeTi
      });

      if (response.status === 200) {
        setSuccess(true);
        // Opcional: Redirigir después de un tiempo
        setTimeout(() => {
          navigate('/login-colaborador'); // Redirige de vuelta a la página de login
        }, 3000);
      }
    } catch (err) {
      console.error('Error al enviar solicitud:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Hubo un error al procesar tu solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="solicitud-creador-container">
      <Card className="solicitud-creador-card shadow-lg">
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="solicitud-title">Solicita ser un Creador <span className="text-fuchsia-electric">AEC</span></h2>
            <p className="text-muted">Completa el formulario para enviar tu solicitud.</p>
          </div>

          {success && <Alert variant="success" className="text-center">¡Solicitud enviada con éxito! Te contactaremos pronto.</Alert>}
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formNombreCompleto">
              <Form.Label>Nombres Completos</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tus nombres y apellidos"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Crea un nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            {/* Nuevo campo "Hablanos un poco de ti" */}
            <Form.Group className="mb-3" controlId="formHablanosDeTi">
              <Form.Label>Háblanos un poco de ti (Opcional)</Form.Label>
              <Form.Control
                as="textarea" // Usamos textarea para múltiples líneas
                rows={3}      // Número de filas visible
                placeholder="Cuéntanos sobre tu experiencia, habilidades o por qué quieres ser un creador AEC."
                value={hablanosDeTi}
                onChange={(e) => setHablanosDeTi(e.target.value)}
              />
            </Form.Group>

            <div className="terms-and-conditions-section mb-4 p-3 border rounded bg-light">
              <p className="mb-2"><strong>Antes de continuar:</strong> al registrarte como Especialista en AEC sdh, aceptas los Términos y Condiciones de uso de la plataforma, que incluyen lo siguiente:</p>
              <ul>
                <li>Declaras ser el autor o tener los derechos sobre los productos digitales que subas.</li>
                <li>Tus productos serán evaluados antes de ser publicados.</li>
                <li>Recibirás el 50% de las ganancias netas por cada venta realizada.</li>
                <li>Autorizas a AEC sdh a exhibir, promocionar y comercializar tus productos.</li>
                <li>AEC sdh podrá despublicar productos que sean obsoletos o no cumplan los estándares.</li>
                <li>Puedes dar de baja tu cuenta en cualquier momento.</li>
              </ul>
              <p>Consulta los <a href="/terminosYcondiciones" target="_blank" className="text-fuchsia-electric fw-bold">Términos y Condiciones completos aquí</a>.</p>

              <Form.Group controlId="formAceptaTerminos">
                <Form.Check
                  type="checkbox"
                  label="Acepto los Términos y Condiciones como Especialista en AEC sdh"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  required
                />
              </Form.Group>
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-100 btn-solicitar"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Solicitar'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SolicitudCreadorPage;