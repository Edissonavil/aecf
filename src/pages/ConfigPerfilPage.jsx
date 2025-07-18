// src/pages/ProfileSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
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
    rol: '', // Mantenemos el rol aquí para usarlo al actualizar
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await userApi.getMyProfile();
        setUserData(prevData => ({
          ...prevData,
          nombreUsuario: res.data.nombreUsuario,
          nombre: res.data.nombre,
          email: res.data.email,
          rol: res.data.rol // ¡Asegúrate de que el rol se carga aquí!
        }));
      } catch (err) {
        console.error("Error al cargar los datos del perfil:", err);
        setError("No se pudieron cargar los datos de tu perfil.");
        toast.error("Error al cargar tu perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
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
      const dataToUpdate = {
        // Incluye los campos que el usuario PUEDE modificar
        nombre: userData.nombre,
        email: userData.email,
        currentPassword: userData.currentPassword, // Esto es para validación en el backend

        // Incluye los campos que el backend necesita para el DTO completo
        // pero que no se modifican en la vista
        nombreUsuario: userData.nombreUsuario, // Se mantiene el nombre de usuario actual
        rol: userData.rol // Se mantiene el rol actual
      };

      // Si tu backend espera 'clave' aunque no se use para cambiarla, podrías necesitar
      // enviarla como el hash de la contraseña actual o dejarla como un campo opcional
      // si tu UserDto la permite como nula para actualizaciones.
      // Por ahora, asumamos que el backend solo necesita 'nombreUsuario' y 'rol' como los campos que deben existir.

      await userApi.updateMyProfile(dataToUpdate);
      setSuccess("Perfil actualizado exitosamente.");
      toast.success("Perfil actualizado correctamente.");
      setUserData(prevData => ({ ...prevData, currentPassword: '' })); // Limpia solo la contraseña actual
    } catch (err) {
      console.error("Error al actualizar perfil:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error al actualizar el perfil. Revisa tus credenciales.");
      toast.error("Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!userData.currentPassword || !userData.newPassword || !userData.confirmNewPassword) {
      setError("Todos los campos de contraseña son obligatorios.");
      setSaving(false);
      return;
    }

    if (userData.newPassword !== userData.confirmNewPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      setSaving(false);
      return;
    }

    if (userData.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      setSaving(false);
      return;
    }

    try {
      await userApi.changeMyPassword({
        currentPassword: userData.currentPassword,
        newPassword: userData.newPassword
      });
      setSuccess("Contraseña cambiada exitosamente. Se cerrará la sesión por seguridad.");
      toast.success("Contraseña cambiada exitosamente.");
      setUserData(prevData => ({
        ...prevData,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      setTimeout(() => {
        logout();
        navigate('/login-colaborador');
      }, 3000);
    } catch (err) {
      console.error("Error al cambiar contraseña:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error al cambiar la contraseña. Revisa tu contraseña actual.");
      toast.error("Error al cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const confirmPassword = prompt("¡ADVERTENCIA! Vas a eliminar tu cuenta. Esto es irreversible. Por favor, ingresa tu contraseña para confirmar la eliminación:");

    if (confirmPassword === null || confirmPassword === '') {
      setError("Eliminación de cuenta cancelada o contraseña no proporcionada.");
      setSaving(false);
      return;
    }

    try {
      await userApi.deleteMyAccount(confirmPassword);
      setSuccess("Tu cuenta ha sido eliminada exitosamente.");
      toast.success("Cuenta eliminada exitosamente.");
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error("Error al eliminar cuenta:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error al eliminar la cuenta. Contraseña incorrecta o error en el servidor.");
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
          <h2 className="text-center">{authUsername} </h2>

          {success && <Alert variant="success" className="text-center">{success}</Alert>}
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          <div className="d-flex justify-content-center mb-4 profile-mode-toggle-buttons">
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

              {/* El campo Rol NO se muestra, pero se mantiene en el estado para enviarlo al backend */}
              {/* <Form.Group className="mb-3" controlId="formRol">
                <Form.Label>Rol</Form.Label>
                <Form.Control
                  type="text"
                  name="rol"
                  value={userData.rol}
                  readOnly
                  disabled
                />
              </Form.Group> */}

              <Form.Group className="mb-4" controlId="formCurrentPasswordUpdate">
                <Form.Label>Contraseña Actual (para confirmar cambios)</Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={userData.currentPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
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
              <Form.Group className="mb-3" controlId="formCurrentPasswordChange">
                <Form.Label>Contraseña Actual</Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={userData.currentPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formNewPassword">
                <Form.Label>Nueva Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={userData.newPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formConfirmNewPassword">
                <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmNewPassword"
                  value={userData.confirmNewPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
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
              <p className="text-muted">Esta acción es irreversible y eliminará todos tus datos. Procede con precaución.</p>
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