/// --- MODELO PARA LOS USUARIOS --- //

const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      // El rol de un usuario puede ser admin, user o invitado.
      type: String,
      enum: ["user", "admin", "guest"],
      default: "user",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationExpires: {
      type: Date,
      default: null,
    },
    passwordResetCode: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    personalInfo: {
      firstName: { type: String },
      lastName: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Implementación del borrado lógico para el modelo de usuarios.
UserSchema.plugin(mongooseDelete, { overrideMethods: "all" });

module.exports = mongoose.model("users", UserSchema);
