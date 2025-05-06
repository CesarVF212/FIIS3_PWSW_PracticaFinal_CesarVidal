// --- DEFINE LAS RUTAS DEL CLIENTE --- //

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const verifiedMiddleware = require("../middleware/verified");
const checkOwnership = require("../middleware/owner");

// Importamos el validador.
const {
  validatorCreateClient,
  validatorUpdateClient,
  validatorGetClient,
} = require("../validators/client");

// Y los contraladores.
const {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  softDeleteClient,
  getArchivedClients,
  restoreClient,
} = require("../controllers/client");

/**
 * @openapi
 * /api/clients:
 *   post:
 *     tags:
 *       - Clients
 *     summary: Crear un nuevo cliente
 *     description: Crea un nuevo cliente asociado al usuario y empresa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Empresa ABC"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contacto@empresaabc.com"
 *               phone:
 *                 type: string
 *                 example: "+34910123456"
 *               contact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Ana Martínez"
 *                   position:
 *                     type: string
 *                     example: "Directora de Proyecto"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "ana.martinez@empresaabc.com"
 *                   phone:
 *                     type: string
 *                     example: "+34612345678"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "Calle Gran Vía 30"
 *                   city:
 *                     type: string
 *                     example: "Madrid"
 *                   state:
 *                     type: string
 *                     example: "Madrid"
 *                   country:
 *                     type: string
 *                     example: "España"
 *                   postalCode:
 *                     type: string
 *                     example: "28013"
 *               taxId:
 *                 type: string
 *                 example: "B12345678"
 *               notes:
 *                 type: string
 *                 example: "Cliente interesado en desarrollo web y móvil"
 *     responses:
 *       200:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Datos de entrada no válidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Datos de entrada no válidos"
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
 *       409:
 *         description: El cliente ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ya existe un cliente con ese nombre o email"
 */
router.post(
  "/",
  authMiddleware,
  verifiedMiddleware,
  validatorCreateClient,
  createClient
);

/**
 * @openapi
 * /api/clients:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Obtener todos los clientes
 *     description: Devuelve una lista de todos los clientes del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
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
router.get("/", authMiddleware, getClients);

/**
 * @openapi
 * /api/clients/archived:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Obtener clientes archivados
 *     description: Devuelve una lista de todos los clientes archivados (soft deleted) del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
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
router.get("/archived", authMiddleware, getArchivedClients);

/**
 * @openapi
 * /api/clients/{id}:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Obtener un cliente por ID
 *     description: Devuelve los detalles de un cliente específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalles del cliente obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
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
 *                   example: "No tiene permisos para acceder a este cliente"
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cliente no encontrado"
 */
router.get("/:id", authMiddleware, validatorGetClient, getClient);

/**
 * @openapi
 * /api/clients/{id}:
 *   put:
 *     tags:
 *       - Clients
 *     summary: Actualizar un cliente
 *     description: Actualiza la información de un cliente existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a actualizar
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
 *               name:
 *                 type: string
 *                 example: "Empresa ABC Actualizada"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevo.contacto@empresaabc.com"
 *               phone:
 *                 type: string
 *                 example: "+34910123457"
 *               contact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Carlos Rodríguez"
 *                   position:
 *                     type: string
 *                     example: "Director de Tecnología"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "carlos.rodriguez@empresaabc.com"
 *                   phone:
 *                     type: string
 *                     example: "+34612345679"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "Calle Alcalá 85"
 *                   city:
 *                     type: string
 *                     example: "Madrid"
 *                   state:
 *                     type: string
 *                     example: "Madrid"
 *                   country:
 *                     type: string
 *                     example: "España"
 *                   postalCode:
 *                     type: string
 *                     example: "28009"
 *               notes:
 *                 type: string
 *                 example: "Cliente con interés en nuevos desarrollos"
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Datos de entrada no válidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Datos de entrada no válidos"
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
 *                   example: "No tiene permisos para modificar este cliente"
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cliente no encontrado"
 */
router.put(
  "/:id",
  authMiddleware,
  validatorGetClient,
  validatorUpdateClient,
  updateClient
);

/**
 * @openapi
 * /api/clients/{id}:
 *   delete:
 *     tags:
 *       - Clients
 *     summary: Eliminar un cliente permanentemente
 *     description: Elimina un cliente de forma permanente del sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a eliminar
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cliente eliminado correctamente"
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
 *                   example: "No tiene permisos para eliminar este cliente"
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cliente no encontrado"
 */
router.delete("/:id", authMiddleware, validatorGetClient, deleteClient);

/**
 * @openapi
 * /api/clients/{id}/soft:
 *   delete:
 *     tags:
 *       - Clients
 *     summary: Archivar un cliente (soft delete)
 *     description: Realiza una eliminación lógica del cliente (lo marca como eliminado sin borrarlo)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a archivar
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente archivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cliente archivado correctamente"
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
 *                   example: "No tiene permisos para archivar este cliente"
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cliente no encontrado"
 */
router.delete(
  "/:id/soft",
  authMiddleware,
  validatorGetClient,
  softDeleteClient
);

/**
 * @openapi
 * /api/clients/{id}/restore:
 *   post:
 *     tags:
 *       - Clients
 *     summary: Restaurar un cliente archivado
 *     description: Restaura un cliente previamente archivado (soft deleted)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a restaurar
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente restaurado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
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
 *                   example: "No tiene permisos para restaurar este cliente"
 *       404:
 *         description: Cliente archivado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cliente archivado no encontrado"
 */
router.post("/:id/restore", authMiddleware, validatorGetClient, restoreClient);

module.exports = router;
