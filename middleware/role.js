// --- REVISA EL ROL DE LOS DIDENTES USUARIOS --- //

const { handleHttpError } = require("../utils/handleError");

const checkRole = (roles) => (req, res, next) => {
  try {
    const { user } = req;

    // Dado un usuario, revisa si existe.
    if (!user) {
      handleHttpError(res, "USER_NOT_FOUND", 404);
      return;
    }

    // Obtiene el rol del usuario desde la petición.
    const userRole = user.role;

    // Revisa si el rol del usuario es uno de los roles permitidos.
    const checkValueRole = roles.some((role) => userRole === role);

    // Si no está permitido, rechaza la petición.
    if (!checkValueRole) {
      handleHttpError(res, "PERMISSION_DENIED", 403);
      return;
    }

    // Si está permitido, deja que la petición continúe.
    next();
  } catch (error) {
    handleHttpError(res, "ROLE_ERROR", 403);
  }
};

module.exports = checkRole;
