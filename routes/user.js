// --- DEFINE LAS RUTAS DEL USUARIO --- //

// Primero importamos todo.
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const verifiedMiddleware = require("../middleware/verified");
const checkRole = require("../middleware/role");
const { uploadMiddleware } = require("../utils/handleStorage");

// Validadores.
const {
  validatorRegister,
  validatorLogin,
  validatorVerification,
  validatorPasswordReset,
  validatorPasswordChange,
  validatorSetNewPassword,
  validatorUpdatePersonalInfo,
  validatorGetUser,
  validatorInviteUser,
} = require("../validators/user");

// Y el controlador del usuario.
const {
  registerUser,
  validateEmail,
  loginUser,
  getUser,
  updateUser,
  updateCompany,
  requestPasswordReset,
  setNewPassword,
  changePassword,
  deleteUser,
  softDeleteUser,
  inviteUser,
} = require("../controllers/user");

// Registrar un nuevo usuario.
//  *     RESPUESTA:
//  *       200: Usuario registrado.
//  *       400: Datos de entrada incorrectos.
//  *       409: El usuario ya existe.
router.post("/register", validatorRegister, registerUser);

// Validar el email del usuario.
//  *     RESPUESTA:
//  *       200: Email verificado con exito.
//  *       400: Código de verificación incorrecto.
//  *       401: No autorizado.
router.put("/validation", authMiddleware, validatorVerification, validateEmail);

// Inicio de sesión del usuario.
//  *     RESPUESTA:
//  *       200: Iniciada la sesión con exito.
//  *       401: Creedenciales inválidos.
//  *       404: Usuario no encontrado.
router.post("/login", validatorLogin, loginUser);

// Obtiene el perfil del usuario.
//  *     RESPUESTA:
//  *       200: Éxito.
//  *       401: No autorizado.
router.get("/", authMiddleware, getUser);

// Actualiza los datos personales del usuario.
//  *     RESPUESTA:
//  *       200: Datos actualizados correctamente.
//  *       400: Datos inválidos.
//  *       401: No autorizado.
router.put("/", authMiddleware, validatorUpdatePersonalInfo, updateUser);

// Actualiza los datos de la empresa del usuario.
//  *     RESPUESTA:
//  *       200: Empresa actualizada correctamente.
//  *       400: Datos inválidos.
//  *       401: No autorizado.
router.patch("/company", authMiddleware, verifiedMiddleware, updateCompany);

// Solicita el restablecimiento de la contraseña.
//  *     RESPUESTA:
//  *       200: Email de recuperación enviado.
//  *       400: Datos inválidos.
router.post("/password-reset", validatorPasswordReset, requestPasswordReset);

// Establece una nueva contraseña tras recuperación.
//  *     RESPUESTA:
//  *       200: Contraseña restablecida.
//  *       400: Código o email inválidos.
router.post("/password-reset/confirm", validatorSetNewPassword, setNewPassword);

// Cambia la contraseña del usuario.
//  *     RESPUESTA:
//  *       200: Contraseña actualizada.
//  *       400: Datos inválidos.
//  *       401: Contraseña actual incorrecta.
router.post(
  "/change-password",
  authMiddleware,
  validatorPasswordChange,
  changePassword
);

// Elimina completamente el usuario.
//  *     RESPUESTA:
//  *       200: Usuario eliminado.
//  *       401: No autorizado.
//  *       403: Prohibido.
//  *       404: Usuario no encontrado.
router.delete("/:id", authMiddleware, validatorGetUser, deleteUser);

// Elimina de forma lógica (soft delete) al usuario.
//  *     RESPUESTA:
//  *       200: Usuario desactivado.
//  *       401: No autorizado.
//  *       403: Prohibido.
//  *       404: Usuario no encontrado.
router.delete("/:id/soft", authMiddleware, validatorGetUser, softDeleteUser);

// Invita a un usuario a la empresa.
//  *     RESPUESTA:
//  *       200: Invitación enviada.
//  *       400: Datos inválidos o sin empresa asociada.
//  *       401: No autorizado.
//  *       403: No tiene permiso para invitar.
router.post(
  "/invite",
  authMiddleware,
  verifiedMiddleware,
  validatorInviteUser,
  inviteUser
);

module.exports = router;
