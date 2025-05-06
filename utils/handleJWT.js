const jwt = require("jsonwebtoken");

// Asegúrate de que JWT_SECRET esté disponible
const JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

// Función para firmar el token
const tokenSign = (user) => {
  try {
    const sign = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    return sign;
  } catch (error) {
    console.error("Error al generar el token:", error);
    return null;
  }
};

// Función para verificar el token
const verifyToken = (tokenJwt) => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET);
  } catch (error) {
    console.log("Error el verificar el token:", error);
    return null;
  }
};

module.exports = { tokenSign, verifyToken };
