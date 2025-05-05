/// --- MODELO PARA EL ALMACENAJE --- //

const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const StorageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String, //  Guarda el tipo de archivo.
      default: "image",
    },
    ipfsHash: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    relatedTo: {
      model: {
        type: String,
        enum: ["user", "company", "client", "project", "deliverynote"],
        default: null,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
// Implementación del borrado lógico para el modelo de almacenamiento.
StorageSchema.plugin(mongooseDelete, { overrideMethods: "all" });

module.exports = mongoose.model("storage", StorageSchema);
