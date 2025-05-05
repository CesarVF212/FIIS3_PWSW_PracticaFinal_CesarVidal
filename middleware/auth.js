// --- MIDDLEWARE PARA LA AUTENTICACION --- //

const { handleHttpError } = require("../utils/handleError");
const { verifyToken } = require("../utils/handleJWT");
const { userModel } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    // Revisa si la petición tiene el header de autorización.
    if (!req.headers.authorization) {
      handleHttpError(res, "NO_TOKEN_PROVIDED", 401);
      return;
    }

    // Obtiene el token del header de autorización.
    const token = req.headers.authorization.split(" ").pop();

    // Verifica el token, obteniendo los datos del
    const dataToken = await verifyToken(token);

    // Si no se pudo verificar el token, lanza un error.
    if (!dataToken) {
      handleHttpError(res, "INVALID_TOKEN", 401);
      return;
    }

    // Encuenta al usuario por la ID en la base de datos.
    const user = await userModel.findById(dataToken._id);

    // En el caso de no encontrar al usuario, lanza un error.
    if (!user) {
      handleHttpError(res, "USER_NOT_FOUND", 404);
      return;
    }

    // Verifica si el usuario tiene sesión activa.
    req.user = user;
    next();
  } catch (error) {
    handleHttpError(res, "SESSION_ERROR", 401);
  }
};

module.exports = authMiddleware;
