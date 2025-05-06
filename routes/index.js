const express = require("express");
const router = express.Router();
const fs = require("fs");
const pathRouter = `${__dirname}`;

// Le quita la extensión
const removeExtension = (fileName) => {
  return fileName.split(".").shift();
};

// Leemos el directorio entero y procesamos las rutas
fs.readdirSync(pathRouter).forEach((file) => {
  const fileWithoutExtension = removeExtension(file);
  const isNotIndex = fileWithoutExtension !== "index";

  // Revisamos que no sea el index (este archivo)
  if (isNotIndex) {
    try {
      console.log(`(routes/index.js) Cargando ruta: ${fileWithoutExtension}`);
      const moduleRouter = require(`./${fileWithoutExtension}`);
      router.use(`/${fileWithoutExtension}`, moduleRouter);
    } catch (error) {
      console.error(`Error al cargar la ruta ${fileWithoutExtension}:`, error);
    }
  }
});

// Ruta por defecto
router.get("/", (req, res) => {
  res.send({ message: "Bienvenido a la CESO-API !!" });
});

module.exports = router;
