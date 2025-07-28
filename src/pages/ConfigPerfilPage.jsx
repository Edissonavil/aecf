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

  // estados para mostrar/ocultar cada contraseña
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await userApi.getMyProfile();
        setUserData(prev => ({
          ...prev,
          nombreUsuario: res.data.nombreUsuario,
          nombre: res.data.nombre,
          email: res.data.email,
          rol: res.data.rol
        }));
      } catch (err) {
        setError("No se pudieron cargar tus datos de perfil.");
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
    if (!userData.currentPassword) {
      setError("Por favor, ingresa tu contraseña actual para confirmar cambios.");
      return;
    }
    setSaving(true);
    setError(null);
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
      setError(err.response?.data?.message || "Error al actualizar el perfil.");
      toast.error("Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = userData;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Todos los campos de contraseña son obligatorios.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await userApi.changeMyPassword({ currentPassword, newPassword });
      setSuccess("Contraseña cambiada exitosamente. Se cerrará sesión por seguridad.");
      toast.success("Contraseña cambiada exitosamente.");
      setUserData({ ...userData, currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => {
        logout();
        navigate('/login-colaborador');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cambiar la contraseña.");
      toast.error("Error al cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmPass = prompt("¡Vas a eliminar tu cuenta! Ingresa tu contraseña para confirmar:");
    if (!confirmPass) {
      setError("Eliminación cancelada o contraseña no proporcionada.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await userApi.deleteMyAccount(confirmPass);
      setSuccess("Cuenta eliminada exitosamente.");
      toast.success("Cuenta eliminada exitosamente.");
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar la cuenta.");
      toast.error("Error al eliminar la cuenta.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center profile-spinner-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando datos de perfil...</span>
        </Spinner>
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
              {/* …otros grupos… */}

              <Form.Group className="mb-4 position-relative" controlId="formCurrentPasswordUpdate">
                <Form.Label>Contraseña Actual (para confirmar cambios)</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={userData.currentPassword}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña actual"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowCurrentPassword(prev => !prev)}
                    aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showCurrentPassword ? '🔒' : '🔑'}
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
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={userData.currentPassword}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña actual"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowCurrentPassword(prev => !prev)}
                    aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showCurrentPassword ? '🔒' : '🔑'}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3 position-relative" controlId="formNewPassword">
                <Form.Label>Nueva Contraseña</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={userData.newPassword}
                    onChange={handleChange}
                    placeholder="Ingresa tu nueva contraseña"
                    required
                    autoComplete="new-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showNewPassword ? '🔒' : '🔑'}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4 position-relative" controlId="formConfirmNewPassword">
                <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    name="confirmNewPassword"
                    value={userData.confirmNewPassword}
                    onChange={handleChange}
                    placeholder="Confirma tu nueva contraseña"
                    required
                    autoComplete="new-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowConfirmNewPassword(prev => !prev)}
                    aria-label={showConfirmNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmNewPassword ? '🔒' : '🔑'}
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
              <Button variant="danger" onClick={handleDeleteAccount} disabled={saving}>
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
