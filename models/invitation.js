/// --- MODELO PARA LAS INVITACIONES --- //

const mongoose = require("mongoose");

const InvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        const now = new Date();
        // Las invitaciones expiran en 7 días.
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      },
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("invitations", InvitationSchema);
