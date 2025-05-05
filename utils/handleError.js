// --- PARA MANDAR ERRORES DEL SERVIDOR --- //

const handleHttpError = (res, message = "Error: ", code = 403) => {
  res.status(code);
  res.send({ error: message });
};

// Exportamos el formato para usarla para manejar errores en la API.
module.exports = { handleHttpError };
