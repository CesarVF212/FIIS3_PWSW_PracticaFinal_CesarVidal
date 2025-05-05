/// --- MODELO PARA LOS PROYECTOS --- //

const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "on-hold", "cancelled"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    budget: {
      amount: { type: Number },
      currency: { type: String, default: "EUR" },
    },
    hourlyRate: {
      amount: { type: Number },
      currency: { type: String, default: "EUR" },
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

// Implementación del borrado lógico para el modelo de proyectos.
ProjectSchema.plugin(mongooseDelete, { overrideMethods: "all" });

module.exports = mongoose.model("projects", ProjectSchema);
