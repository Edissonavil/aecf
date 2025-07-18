import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner, InputGroup, FormControl } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as userApi from '../services/userApi';
import { toast } from 'react-toastify';

const AdminManageUsersPage = () => {
  const { role, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Nuevos estados para búsqueda y filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('TODOS'); // 'TODOS' es el valor por defecto

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombreUsuario: '',
    nombre: '',
    email: '',
    rol: '',
  });
  const [savingChanges, setSavingChanges] = useState(false);
  const [editModalError, setEditModalError] = useState(null);

  // Estados para el modal de resetear contraseña
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resettingUser, setResettingUser] = useState(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');

  // Mapeo para mostrar los roles de forma amigable
  const roleDisplayMap = {
    'ROL_ADMIN': 'Administrador',
    'ROL_COLABORADOR': 'Creador',
    'ROL_CLIENTE': 'Cliente',
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userApi.getAllUsers();
      setUsers(res.data.dato || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(err.response?.data?.message || 'Error al cargar los usuarios.');
      toast.error('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && role !== 'ROL_ADMIN') {
      toast.error('Acceso denegado. Solo administradores.');
      navigate('/');
      return;
    }
    if (!isAuthLoading && role === 'ROL_ADMIN') {
      fetchUsers();
    }
  }, [isAuthLoading, role, navigate, fetchUsers]);

  // Lógica de filtrado y búsqueda en el frontend
  const filteredUsers = users.filter(user => {
    const matchesSearchTerm = searchTerm === '' ||
      user.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'TODOS' || user.rol === filterRole;

    return matchesSearchTerm && matchesRole;
  });

  // Manejo de Modales
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEditFormData({
      nombreUsuario: user.nombreUsuario,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
    setEditModalError(null);
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSaveUserChanges = async (e) => {
    e.preventDefault();
    setSavingChanges(true);
    setEditModalError(null);

    try {
      await userApi.updateUserByAdmin(currentUser.idU, editFormData);
      toast.success('Usuario actualizado exitosamente.');
      fetchUsers();
      setShowEditModal(false);
    } catch (err) {
      console.error("Error al guardar cambios del usuario:", err.response?.data || err.message);
      setEditModalError(err.response?.data?.message || 'Error al actualizar el usuario.');
      toast.error('Error al guardar cambios del usuario.');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"? Esta acción es irreversible.`)) {
      try {
        await userApi.deleteUserByAdmin(userId);
        toast.success(`Usuario "${username}" eliminado exitosamente.`);
        fetchUsers();
      } catch (err) {
        console.error("Error al eliminar usuario:", err.response?.data || err.message);
        setError(err.response?.data?.message || 'Error al eliminar el usuario.');
        toast.error('Error al eliminar usuario.');
      }
    }
  };

  const handleResetPassword = (user) => {
    setResettingUser(user);
    setTemporaryPassword('');
    setResetPasswordError(null);
    setShowResetPasswordModal(true);
  };

  const handleConfirmResetPassword = async () => {
    setResettingPassword(true);
    setResetPasswordError(null);
    try {
      const res = await userApi.resetUserPassword(resettingUser.id);
      setTemporaryPassword(res.data.temporaryPassword || 'Contraseña temporal generada. Revisa la consola del servidor o el correo del usuario.');
      toast.success('Contraseña temporal generada.');
      setResettingPassword(false);
    } catch (err) {
      console.error("Error al resetear contraseña:", err.response?.data || err.message);
      setResetPasswordError(err.response?.data?.message || 'Error al resetear la contraseña.');
      toast.error('Error al resetear contraseña.');
      setResettingPassword(false);
    }
  };

  if (isAuthLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando autenticación...</span>
        </Spinner>
      </Container>
    );
  }

  if (role !== 'ROL_ADMIN') {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center">
          Acceso denegado. Esta página es solo para administradores.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando usuarios...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h1 className="text-center mb-4">Gestión de Usuarios</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="mb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <InputGroup className="mb-3 mb-md-0 me-md-2">
          <FormControl
            placeholder="Buscar por nombre de usuario, nombre, o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Form.Group controlId="filterRole" className="flex-shrink-0">
          <Form.Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="TODOS">Ver todos los Roles</option>
            {/* Opciones del filtro */}
            <option value="ROL_ADMIN">Administrador</option>
            <option value="ROL_COLABORADOR">Creador</option>
            <option value="ROL_CLIENTE">Cliente</option>
          </Form.Select>
        </Form.Group>
      </div>

      <div className="table-responsive shadow-sm">
        <Table striped bordered hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre de Usuario</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No hay usuarios para mostrar con los filtros aplicados.</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                 <td>{user.id}</td>
                  <td>{user.nombreUsuario}</td>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  {/* Mostrar el rol de forma amigable */}
                  <td>{roleDisplayMap[user.rol] || user.rol}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditUser(user)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleResetPassword(user)}
                    >
                      Resetear Contraseña
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.nombreUsuario)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de Edición de Usuario */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario: {currentUser?.nombreUsuario}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editModalError && <Alert variant="danger">{editModalError}</Alert>}
          <Form onSubmit={handleSaveUserChanges}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control
                type="text"
                name="nombreUsuario"
                value={editFormData.nombreUsuario}
                readOnly
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={editFormData.nombre}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="rol"
                value={editFormData.rol}
                onChange={handleEditFormChange}
                required
              >
                {/* Opciones del selector de rol en el modal */}
                <option value="ROL_CLIENTE">Cliente</option>
                <option value="ROL_COLABORADOR">Creador</option>
                <option value="ROL_ADMIN">Administrador</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={savingChanges}>
              {savingChanges ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Guardando...
                </>
              ) : 'Guardar Cambios'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de Resetear Contraseña */}
      <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Resetear Contraseña para {resettingUser?.nombreUsuario}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resetPasswordError && <Alert variant="danger">{resetPasswordError}</Alert>}
          {temporaryPassword ? (
            <Alert variant="success">
              La contraseña temporal generada para **{resettingUser?.nombreUsuario}** es:
              <br/>
              <strong>{temporaryPassword}</strong>
              <br/>
              <small>Notifica esta contraseña al usuario. Deberá cambiarla al iniciar sesión.</small>
            </Alert>
          ) : (
            <>
              <p>¿Estás seguro de que deseas resetear la contraseña para el usuario **{resettingUser?.nombreUsuario}**?</p>
              <p>Se generará una contraseña temporal para él/ella.</p>
              <Button
                variant="warning"
                onClick={handleConfirmResetPassword}
                disabled={resettingPassword}
              >
                {resettingPassword ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Generando...
                  </>
                ) : 'Confirmar Reseteo'}
              </Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminManageUsersPage;