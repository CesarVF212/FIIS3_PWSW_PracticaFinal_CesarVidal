/// --- MODELO PARA LAS EMPRESAS --- //

const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    legalName: {
      type: String,
    },
    cif: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    logo: {
      type: String,
    },
    website: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Implementación del borrado lógico para el modelo de empresas.
CompanySchema.plugin(mongooseDelete, { overrideMethods: "all" });

module.exports = mongoose.model("companies", CompanySchema);
