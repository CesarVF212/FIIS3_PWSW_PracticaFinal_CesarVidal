// --- DEFINE LAS RUTAS DE LOS ALBARANES --- //

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const verifiedMiddleware = require("../middleware/verified");
const { uploadMiddleware } = require("../utils/handleStorage");

const {
  validatorCreateDeliveryNote,
  validatorUpdateDeliveryNote,
  validatorGetDeliveryNote,
  validatorSignDeliveryNote,
} = require("../validators/deliveryNote");

const {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNote,
  updateDeliveryNote,
  deleteDeliveryNote,
  signDeliveryNote,
  getDeliveryNotePdf,
} = require("../controllers/deliveryNote");

// Crea un nuevo parte de entrega.
//  *     RESPUESTA:
//  *       200: Parte creado correctamente.
//  *       400: Datos inválidos.
//  *       401: No autorizado.
//  *       403: Prohibido.
//  *       404: Proyecto o cliente no encontrado.
router.post(
  "/",
  authMiddleware,
  verifiedMiddleware,
  validatorCreateDeliveryNote,
  createDeliveryNote
);

// Obtiene todos los partes de entrega.
//  *     RESPUESTA:
//  *       200: Lista de partes.
//  *       401: No autorizado.
router.get("/", authMiddleware, getDeliveryNotes);

// Obtiene un parte de entrega por su ID.
//  *     RESPUESTA:
//  *       200: Parte obtenido correctamente.
//  *       401: No autorizado.
//  *       403: Prohibido.
//  *       404: Parte no encontrado.
router.get("/:id", authMiddleware, validatorGetDeliveryNote, getDeliveryNote);

// Actualiza un parte de entrega.
//  *     RESPUESTA:
//  *       200: Parte actualizado.
//  *       400: Datos inválidos.
//  *       401: No autorizado.
//  *       403: Prohibido.
//  *       404: Parte no encontrado.
router.put(
  "/:id",
  authMiddleware,
  verifiedMiddleware,
  validatorUpdateDeliveryNote,
  updateDeliveryNote
);

// Elimina un parte de entrega.
//  *     RESPUESTA:
//  *       200: Parte eliminado.
//  *       401: No autorizado.
//  *       403: Prohibido.
//  *       404: Parte no encontrado.
router.delete(
  "/:id",
  authMiddleware,
  verifiedMiddleware,
  validatorGetDeliveryNote,
  deleteDeliveryNote
);

// Firma un parte de entrega.
//  *     RESPUESTA:
//  *       200: Parte firmado.
//  *       400: Datos inválidos.
//  *       401: No autorizado.
//  *       403: Prohibido.
//  *       404: Parte no encontrado.
router.post(
  "/:id/sign",
  authMiddleware,
  validatorSignDeliveryNote,
  signDeliveryNote
);

// Descarga el PDF del parte de entrega.
//  *     RESPUESTA:
//  *       200: PDF generado correctamente.
//  *       401: No autorizado.
//  *       403: Prohibido.
//  *       404: Parte no encontrado.
router.get(
  "/:id/pdf",
  authMiddleware,
  validatorGetDeliveryNote,
  getDeliveryNotePdf
);

module.exports = router;
