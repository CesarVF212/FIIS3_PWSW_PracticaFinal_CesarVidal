// --- MODELO DE DATOS DE USUARIO PARA NOSQL --- //

const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

// Define el esquema de datos para un usuario en MongoDB.
const UserScheme = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    age: {
      type: Number,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    // El rol puede ser de tipo usuario o administrador, y por defecto es usuario.
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Esto hace que se creen los campos createdAt y updatedAt automáticamente.
    versionKey: false, // Esto elimina el campo __v que se crea automáticamente en MongoDB.
  }
);

// Implementación de la elimiación lógica (soft delete).
UserScheme.plugin(mongooseDelete, { overrideMethods: "all" });

module.exports = mongoose.model("users", UserScheme);
