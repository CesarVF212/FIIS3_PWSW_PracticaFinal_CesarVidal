// --- MIDDLEWARE PARA LA AUTENTICACION --- //
const { handleHttpError } = require("../utils/handleError");
const { verifyToken } = require("../utils/handleJWT");
const { userModel } = require("../models");

/**
 * Middleware de autenticación que verifica el token JWT
 * y carga el usuario en la request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Revisa si la petición tiene el header de autorización
    if (!req.headers.authorization) {
      handleHttpError(res, "NO_TOKEN_PROVIDED", 401);
      return;
    }

    // Obtiene el token del header de autorización con manejo mejorado
    let token = req.headers.authorization;

    if (token.startsWith("Bearer ")) {
      token = token.slice(7); // Elimina 'Bearer ' del inicio
    } else {
      // Método alternativo si no tiene el formato esperado
      token = token.split(" ").pop();
    }

    // Verifica el token JWT
    const dataToken = await verifyToken(token);

    // Si no se pudo verificar el token, lanza un error
    if (!dataToken) {
      handleHttpError(res, "INVALID_TOKEN", 401);
      return;
    }

    // Verificar que el token tiene el campo _id
    if (!dataToken._id) {
      handleHttpError(res, "INVALID_TOKEN_PAYLOAD", 401);
      return;
    }

    // Encuentra al usuario por la ID en la base de datos
    const user = await userModel.findById(dataToken._id);

    // En el caso de no encontrar al usuario, lanza un error
    if (!user) {
      handleHttpError(res, "USER_NOT_FOUND", 404);
      return;
    }

    // Añade el usuario a la request para uso en controladores
    req.user = user;
    next();
  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    handleHttpError(res, "SESSION_ERROR", 401);
  }
};

module.exports = authMiddleware;
