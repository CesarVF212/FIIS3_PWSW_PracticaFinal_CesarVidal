/// --- MODELO PARA LOS ALBARANES --- //

const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

// Para registrar las horas trabajadas (mano de obra).
const LaborEntrySchema = new mongoose.Schema(
  {
    person: {
      name: { type: String, required: true },
      role: { type: String },
    },
    hours: { type: Number, required: true },
    // Rate es a cuanto se cobra la hora.
    rate: {
      amount: { type: Number },
      currency: { type: String, default: "EUR" },
    },
    date: { type: Date, default: Date.now },
    description: { type: String },
  },
  { _id: true }
);

// Para registrar los materiales utilizados.
const MaterialEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "unit" }, // e.g., unit, kg, liter, etc.
    price: {
      amount: { type: Number },
      currency: { type: String, default: "EUR" },
    },
    description: { type: String },
  },
  { _id: true }
);

// El propio del albaran.
const DeliveryNoteSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: true,
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
    labor: [LaborEntrySchema],
    materials: [MaterialEntrySchema],
    notes: {
      type: String,
    },
    totalAmount: {
      amount: { type: Number },
      currency: { type: String, default: "EUR" },
    },
    status: {
      type: String,
      enum: ["draft", "sent", "signed", "paid", "cancelled"],
      default: "draft",
    },
    signatureImage: {
      type: String,
      default: null,
    },
    signedBy: {
      type: String,
      default: null,
    },
    signedAt: {
      type: Date,
      default: null,
    },
    pdfUrl: {
      type: String, // URL to PDF stored in IPFS
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Sirve para generar el número del albarán automáticamente al crear uno nuevo.
DeliveryNoteSchema.pre("save", async function (next) {
  const doc = this;
  if (!doc.isNew) {
    return next();
  }

  try {
    // Utiliza el año para una id única.
    const currentYear = new Date().getFullYear();

    // Dentro de los albaranes de este año, te da el número siguiente (mas alto).
    const lastDeliveryNote = await mongoose.model("deliverynotes").findOne(
      {
        number: { $regex: `^DN-${currentYear}-` },
        company: doc.company,
      },
      {},
      { sort: { number: -1 } }
    );

    let nextNumber = 1;
    if (lastDeliveryNote) {
      const parts = lastDeliveryNote.number.split("-");
      nextNumber = parseInt(parts[2], 10) + 1;
    }

    // Le da el fotmato de fecha al número del albarán.
    doc.number = `DN-${currentYear}-${nextNumber.toString().padStart(4, "0")}`;

    next();
  } catch (error) {
    next(error);
  }
});

// Antes de guardar el albarán, calcula el total de la mano de obra y materiales.
DeliveryNoteSchema.pre("save", function (next) {
  let totalAmount = 0;

  // Suma el coste de la mano de obra.
  if (this.labor && this.labor.length > 0) {
    this.labor.forEach((item) => {
      if (item.hours && item.rate && item.rate.amount) {
        totalAmount += item.hours * item.rate.amount;
      }
    });
  }

  // Suma el coste de los materiales.
  if (this.materials && this.materials.length > 0) {
    this.materials.forEach((item) => {
      if (item.quantity && item.price && item.price.amount) {
        totalAmount += item.quantity * item.price.amount;
      }
    });
  }

  this.totalAmount = {
    amount: totalAmount,
    currency: "EUR",
  };

  next();
});

// Implementación del borrado lógico para el modelo de albaranes.
DeliveryNoteSchema.plugin(mongooseDelete, { overrideMethods: "all" });

module.exports = mongoose.model("deliverynotes", DeliveryNoteSchema);
