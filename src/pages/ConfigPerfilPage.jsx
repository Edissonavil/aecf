// src/pages/ProfileSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userApi from '../services/userApi';
import { toast } from 'react-toastify';
import '../styles/ConfigPerfilPage.css';

const ConfigPerfilPage = () => {
  const { username: authUsername, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    nombreUsuario: '',
    nombre: '',
    email: '',
    rol: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false);

  // States para mostrar/ocultar cada contraseña
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await userApi.getMyProfile();
        setUserData(prev => ({
          ...prev,
          nombreUsuario: res.data.nombreUsuario,
          nombre: res.data.nombre,
          email: res.data.email,
          rol: res.data.rol
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos de tu perfil.");
        toast.error("Error al cargar tu perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!userData.currentPassword) {
      setError("Por favor, ingresa tu contraseña actual para confirmar los cambios.");
      setSaving(false);
      return;
    }

    try {
      await userApi.updateMyProfile({
        nombre: userData.nombre,
        email: userData.email,
        currentPassword: userData.currentPassword,
        nombreUsuario: userData.nombreUsuario,
        rol: userData.rol
      });
      setSuccess("Perfil actualizado exitosamente.");
      toast.success("Perfil actualizado correctamente.");
      setUserData(prev => ({ ...prev, currentPassword: '' }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al actualizar el perfil.");
      toast.error("Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { currentPassword, newPassword, confirmNewPassword } = userData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Todos los campos de contraseña son obligatorios.");
      setSaving(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      setSaving(false);
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      setSaving(false);
      return;
    }

    try {
      await userApi.changeMyPassword({ currentPassword, newPassword });
      setSuccess("Contraseña cambiada exitosamente. Se cerrará la sesión.");
      toast.success("Contraseña cambiada exitosamente.");
      setUserData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      setTimeout(() => {
        logout();
        navigate('/login-colaborador');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al cambiar la contraseña.");
      toast.error("Error al cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const confirmPassword = prompt("¡ADVERTENCIA! Esto eliminará tu cuenta. Ingresa tu contraseña:");
    if (!confirmPassword) {
      setError("Eliminación cancelada o contraseña no proporcionada.");
      setSaving(false);
      return;
    }

    try {
      await userApi.deleteMyAccount(confirmPassword);
      setSuccess("Cuenta eliminada exitosamente.");
      toast.success("Cuenta eliminada exitosamente.");
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al eliminar la cuenta.");
      toast.error("Error al eliminar la cuenta.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center profile-spinner-container">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="profile-settings-container">
      <Card className="profile-settings-card">
        <Card.Body>
          <h1 className="text-center">Configuración de Perfil</h1>
          <h2 className="text-center">{authUsername}</h2>

          {success && <Alert variant="success" className="text-center">{success}</Alert>}
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          <div className="d-flex justify-content-center mb-4">
            <Button
              variant={!isPasswordChangeMode ? 'primary' : 'outline-primary'}
              onClick={() => setIsPasswordChangeMode(false)}
              className="me-2"
            >
              Editar Datos
            </Button>
            <Button
              variant={isPasswordChangeMode ? 'primary' : 'outline-primary'}
              onClick={() => setIsPasswordChangeMode(true)}
            >
              Cambiar Contraseña
            </Button>
          </div>

          {!isPasswordChangeMode ? (
            <Form onSubmit={handleUpdateProfile}>
              <Form.Group className="mb-3" controlId="formNombreUsuario">
                <Form.Label>Nombre de Usuario</Form.Label>
                <Form.Control
                  type="text"
                  name="nombreUsuario"
                  value={userData.nombreUsuario}
                  readOnly
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formNombre">
                <Form.Label>Nombre Completo</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={userData.nombre}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4 position-relative" controlId="formCurrentPasswordUpdate">
                <Form.Label>Contraseña Actual</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showCurrent ? 'text' : 'password'}
                    name="currentPassword"
                    value={userData.currentPassword}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña actual"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowCurrent(prev => !prev)}
                    aria-label={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showCurrent ? '🔒' : '🔑'}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                className="w-100"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleChangePassword}>
              <Form.Group className="mb-3 position-relative" controlId="formCurrentPasswordChange">
                <Form.Label>Contraseña Actual</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showCurrent ? 'text' : 'password'}
                    name="currentPassword"
                    value={userData.currentPassword}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña actual"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowCurrent(prev => !prev)}
                    aria-label={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showCurrent ? '🔒' : '🔑'}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3 position-relative" controlId="formNewPassword">
                <Form.Label>Nueva Contraseña</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showNew ? 'text' : 'password'}
                    name="newPassword"
                    value={userData.newPassword}
                    onChange={handleChange}
                    placeholder="Ingresa tu nueva contraseña"
                    required
                    autoComplete="new-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowNew(prev => !prev)}
                    aria-label={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showNew ? '🔒' : '🔑'}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4 position-relative" controlId="formConfirmNewPassword">
                <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmNewPassword"
                    value={userData.confirmNewPassword}
                    onChange={handleChange}
                    placeholder="Confirma tu nueva contraseña"
                    required
                    autoComplete="new-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowConfirm(prev => !prev)}
                    aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirm ? '🔒' : '🔑'}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button
                variant="warning"
                type="submit"
                className="w-100 text-white"
                disabled={saving}
              >
                {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </Form>
          )}

          <Card className="mt-5 border-danger">
            <Card.Body>
              <h5 className="text-danger">Eliminar Cuenta</h5>
              <p className="text-muted">Esta acción es irreversible y eliminará todos tus datos.</p>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={saving}
              >
                Eliminar Mi Cuenta
              </Button>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ConfigPerfilPage;
