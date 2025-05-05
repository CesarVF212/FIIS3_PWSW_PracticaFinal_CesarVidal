/// --- MODELO PARA LOS CLIENTES --- //

const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    contact: {
      name: { type: String },
      position: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    taxId: {
      // CIF/NIF in Spain
      type: String,
    },
    notes: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Implementación del borrado lógico para el modelo de clientes.
ClientSchema.plugin(mongooseDelete, { overrideMethods: "all" });

module.exports = mongoose.model("clients", ClientSchema);
