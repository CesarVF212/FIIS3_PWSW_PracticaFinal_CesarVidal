// --- DEFINE LAS RUTAS DE LOS ALBARANES --- //

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const verifiedMiddleware = require("../middleware/verified");
const { uploadMiddleware } = require("../utils/handleStorage");

// Importamos el validador.
const {
  validatorCreateDeliveryNote,
  validatorUpdateDeliveryNote,
  validatorGetDeliveryNote,
  validatorSignDeliveryNote,
} = require("../validators/deliveryNote");

// Y los controladores.
const {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNote,
  updateDeliveryNote,
  deleteDeliveryNote,
  signDeliveryNote,
  getDeliveryNotePdf,
} = require("../controllers/deliveryNote");

/**
 * @openapi
 * /api/deliverynotes:
 *   post:
 *     tags:
 *       - DeliveryNotes
 *     summary: Crear un nuevo parte de entrega
 *     description: Crea un nuevo parte de entrega asociado a un proyecto y cliente
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project
 *               - date
 *             properties:
 *               number:
 *                 type: string
 *                 example: "DE-2023-001"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-06-15T10:00:00.000Z"
 *               project:
 *                 type: string
 *                 format: objectId
 *                 example: "60d21b4667d0d8992e610c85"
 *               labor:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     person:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Juan Pérez"
 *                         role:
 *                           type: string
 *                           example: "Técnico"
 *                     hours:
 *                       type: number
 *                       example: 8
 *                     rate:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                           example: 35
 *                         currency:
 *                           type: string
 *                           example: "EUR"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-06-15T10:00:00.000Z"
 *                     description:
 *                       type: string
 *                       example: "Instalación de equipos"
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Cable de red Cat 6"
 *                     quantity:
 *                       type: number
 *                       example: 100
 *                     unit:
 *                       type: string
 *                       example: "metros"
 *                     price:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                           example: 2.5
 *                         currency:
 *                           type: string
 *                           example: "EUR"
 *                     description:
 *                       type: string
 *                       example: "Cable de red para instalación"
 *               notes:
 *                 type: string
 *                 example: "Trabajo realizado según lo previsto"
 *               status:
 *                 type: string
 *                 enum: [draft, sent, signed, paid, cancelled]
 *                 default: draft
 *                 example: "draft"
 *     responses:
 *       200:
 *         description: Parte creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Datos inválidos"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No tiene permisos para realizar esta acción"
 *       404:
 *         description: Proyecto o cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Proyecto o cliente no encontrado"
 */
router.post(
  "/",
  authMiddleware,
  verifiedMiddleware,
  validatorCreateDeliveryNote,
  createDeliveryNote
);

/**
 * @openapi
 * /api/deliverynotes:
 *   get:
 *     tags:
 *       - DeliveryNotes
 *     summary: Obtener todos los partes de entrega
 *     description: Devuelve una lista de todos los partes de entrega asociados al usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, signed, paid, cancelled]
 *         description: Filtrar por estado del parte
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: ID del proyecto para filtrar
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de partes obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeliveryNote'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 */
router.get("/", authMiddleware, getDeliveryNotes);

/**
 * @openapi
 * /api/deliverynotes/{id}:
 *   get:
 *     tags:
 *       - DeliveryNotes
 *     summary: Obtener un parte de entrega por ID
 *     description: Devuelve los detalles de un parte de entrega específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del parte de entrega
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parte obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No tiene permisos para acceder a este parte"
 *       404:
 *         description: Parte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Parte no encontrado"
 */
router.get("/:id", authMiddleware, validatorGetDeliveryNote, getDeliveryNote);

/**
 * @openapi
 * /api/deliverynotes/{id}:
 *   put:
 *     tags:
 *       - DeliveryNotes
 *     summary: Actualizar un parte de entrega
 *     description: Actualiza la información de un parte de entrega existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del parte de entrega a actualizar
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-06-20T10:00:00.000Z"
 *               labor:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     person:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Ana Martínez"
 *                         role:
 *                           type: string
 *                           example: "Ingeniera"
 *                     hours:
 *                       type: number
 *                       example: 6
 *                     rate:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                           example: 40
 *                         currency:
 *                           type: string
 *                           example: "EUR"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-06-20T10:00:00.000Z"
 *                     description:
 *                       type: string
 *                       example: "Configuración de equipos"
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Router WiFi"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     unit:
 *                       type: string
 *                       example: "unidades"
 *                     price:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                           example: 75
 *                         currency:
 *                           type: string
 *                           example: "EUR"
 *                     description:
 *                       type: string
 *                       example: "Router wifi de alta velocidad"
 *               notes:
 *                 type: string
 *                 example: "Actualización del trabajo con configuración adicional"
 *               status:
 *                 type: string
 *                 enum: [draft, sent, signed, paid, cancelled]
 *                 example: "sent"
 *     responses:
 *       200:
 *         description: Parte actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Datos inválidos"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No tiene permisos para modificar este parte"
 *       404:
 *         description: Parte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Parte no encontrado"
 */
router.put(
  "/:id",
  authMiddleware,
  verifiedMiddleware,
  validatorUpdateDeliveryNote,
  updateDeliveryNote
);

/**
 * @openapi
 * /api/deliverynotes/{id}:
 *   delete:
 *     tags:
 *       - DeliveryNotes
 *     summary: Eliminar un parte de entrega
 *     description: Elimina un parte de entrega del sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del parte de entrega a eliminar
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parte eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Parte eliminado correctamente"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No tiene permisos para eliminar este parte"
 *       404:
 *         description: Parte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Parte no encontrado"
 */
router.delete(
  "/:id",
  authMiddleware,
  verifiedMiddleware,
  validatorGetDeliveryNote,
  deleteDeliveryNote
);

/**
 * @openapi
 * /api/deliverynotes/{id}/sign:
 *   post:
 *     tags:
 *       - DeliveryNotes
 *     summary: Firmar un parte de entrega
 *     description: Añade una firma digital a un parte de entrega
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del parte de entrega a firmar
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - signature
 *               - signedBy
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de la firma
 *               signedBy:
 *                 type: string
 *                 example: "Juan González - Cliente"
 *     responses:
 *       200:
 *         description: Parte firmado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Datos inválidos o firma no proporcionada"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No tiene permisos para firmar este parte"
 *       404:
 *         description: Parte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Parte no encontrado"
 */
router.post(
  "/:id/sign",
  authMiddleware,
  validatorSignDeliveryNote,
  signDeliveryNote
);

/**
 * @openapi
 * /api/deliverynotes/{id}/pdf:
 *   get:
 *     tags:
 *       - DeliveryNotes
 *     summary: Descargar el PDF del parte de entrega
 *     description: Genera y devuelve un archivo PDF con el parte de entrega
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del parte de entrega
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF generado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No tiene permisos para acceder a este parte"
 *       404:
 *         description: Parte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Parte no encontrado"
 */
router.get(
  "/:id/pdf",
  authMiddleware,
  validatorGetDeliveryNote,
  getDeliveryNotePdf
);

module.exports = router;
