// --- CONFIGURACIÓN DE MONGODB --- //

const mongoose = require("mongoose");

const dbConnect = async () => {
  // Nos conectamos a la base de datos con la url especificada en el .env.
  // Si estamos en modo test, usamos la base de datos de test.
  const DB_URI =
    process.env.NODE_ENV === "test"
      ? process.env.DB_URI_TEST
      : process.env.DB_URI;
  mongoose.set("strictQuery", false);

  // Esperamos la conexión a la base de datos.
  try {
    await mongoose.connect(DB_URI);
    console.log("(config/mongo.js) Conexión a MongoDB establecida.");
  } catch (err) {
    console.error("(config/mongo.js) Conexión a MongoDB rechazada:\n", err);
  }
};

module.exports = { dbConnect };
