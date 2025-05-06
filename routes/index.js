// --- DEFINE LAS RUTAS GENERALES --- //

const express = require("express");
const router = express.Router();
const fs = require("fs");

const pathRouter = `${__dirname}`;

// Le quita la expresión.
const removeExtension = (fileName) => {
  return fileName.split(".").shift();
};

// Leemos el directorio entero y cogemos las rutas.
fs.readdirSync(pathRouter).filter((file) => {
  const fileWithoutExtension = removeExtension(file);
  const isNotIndex = fileWithoutExtension !== "index";

  // Revisamos que no sea el index (este archivo).
  if (isNotIndex) {
    router.use(
      `/${fileWithoutExtension}`,
      require(`./${fileWithoutExtension}`)
    );
  }
});

// Ruta por defecto.
router.get("/", (req, res) => {
  res.send({ message: "Bienvenido a la CESO-API !!" });
});

module.exports = router;
