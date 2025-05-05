// --- SE ENCARGA DE MANEJAR SI ESTAS VERIFICADO --- //

const { handleHttpError } = require("../utils/handleError");

const verifiedMiddleware = (req, res, next) => {
  try {
    const { user } = req;

    // Obtiene el usuario.
    if (!user) {
      handleHttpError(res, "USER_NOT_FOUND", 404);
      return;
    }

    // Verifica si el usuario está verificado (del email).
    if (!user.verified) {
      handleHttpError(res, "EMAIL_NOT_VERIFIED", 403);
      return;
    }

    // En caso de que si, deja continuar.
    next();
  } catch (error) {
    handleHttpError(res, "VERIFICATION_ERROR", 403);
  }
};

module.exports = verifiedMiddleware;
