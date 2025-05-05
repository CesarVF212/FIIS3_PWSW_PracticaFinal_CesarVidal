// --- ENCRIPTACIÓN Y DESENCRIPTACIÓN DE CONTRASEÑAS --- //

const bcryptjs = require("bcryptjs");

// De la contraseña normal. byscript nos a la versión encriptada para enviar a la base de datos.
const encrypt = async (plainPassword) => {
  const hash = await bcryptjs.hash(plainPassword, 10);
  return hash;
};

// Hacemos el proceso contrario, dadas las dos contraseñas, vemos sin tras desencriptar la de la base de datos coinciden.
const compare = async (plainPassword, hashedPassword) => {
  return await bcryptjs.compare(plainPassword, hashedPassword);
};

module.exports = { encrypt, compare };
