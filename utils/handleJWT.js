// --- MANEJA LOS TOKENS DE JWT PARA LA AUTENTICACIÓN Y AUTORIZACIÓN --- //

const jwt = require("jsonwebtoken");

// Obtenemos los datos de la clave y expiración desde el .env.
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "2h";

// Definimos el algoritmo de encriptación para el token.
const tokenSign = (user) => {
  const sign = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      company: user.company,
    },
    // Esta es la clave secreta que se utiliza para firmar el token.
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRATION, // Actualizamos la expiración del token.
    }
  );
  return sign;
};

// Verificamos el token y ubtenemos de el los datos del usuario.
const verifyToken = (tokenJwt) => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET);
  } catch (err) {
    console.log(`(utils/handleJWT.js) Error el verificar el token:\n${err}`);
    return null;
  }
};

module.exports = { tokenSign, verifyToken };
