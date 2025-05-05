// -- ARCHIVO PRINCIPAL DE LA APLICACIÓN -- //
// INICIALIZACIÓN DEL SERVIDOR, CONEXIÓN A LA BASE DE DATOS Y BUCLE DEL DEMONIO.

// Importaciones.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morganBody = require("morgan-body");
const swaggerUi = require("swagger-ui-express");

const app = express();

const { dbConnect } = require("./config/mongo");
const swaggerSpecs = require("./docs/swagger");
const loggerStream = require("./utils/handleLogger");

// Middleware.
app.use(cors());
app.use(express.json());
app.use(express.static("storage")); // Public folder for files

// Logueo de errores a Slack.
morganBody(app, {
  noColors: true,
  skip: function (req, res) {
    return res.statusCode < 400;
  },
  stream: loggerStream,
});

// Uso de swagger para la documentación de la API.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes.
app.use("/api", require("./routes"));

// Conexión a la base de datos.
dbConnect();

// Iniciación del servidor con el puerto especificado en el .env o 3000 por defecto.
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`(app.js) Servidor corriendo en el puerto ${port}`);
});

// Exportamos para poder usar en los tests.
module.exports = { app, server };
