// --- DEFINE LAS RUTAS DEL PROYECTO --- //

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const verifiedMiddleware = require("../middleware/verified");
const checkOwnership = require("../middleware/owner");

// Importamos el validador.
const {
  validatorCreateProject,
  validatorUpdateProject,
  validatorGetProject,
} = require("../validators/project");

// Y los controladores.
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  softDeleteProject,
  getArchivedProjects,
  restoreProject,
} = require("../controllers/project");

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Crear un nuevo proyecto
 *     description: Crea un nuevo proyecto asociado al usuario y cliente
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
 *               - client
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Desarrollo de aplicación web"
 *               description:
 *                 type: string
 *                 example: "Desarrollo de una aplicación web con React y Node.js"
 *               client:
 *                 type: string
 *                 format: objectId
 *                 example: "60d21b4667d0d8992e610c85"
 *               status:
 *                 type: string
 *                 enum: [active, completed, on-hold, cancelled]
 *                 default: active
 *                 example: "active"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-06-01T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-31T00:00:00.000Z"
 *               budget:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 10000
 *                   currency:
 *                     type: string
 *                     example: "EUR"
 *               hourlyRate:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 50
 *                   currency:
 *                     type: string
 *                     example: "EUR"
 *     responses:
 *       200:
 *         description: Proyecto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *                   example: "No tiene permisos para realizar esta acción"
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
 *       409:
 *         description: El proyecto ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ya existe un proyecto con ese nombre para este cliente"
 */
router.post(
  "/",
  authMiddleware,
  verifiedMiddleware,
  validatorCreateProject,
  createProject
);

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Obtener todos los proyectos
 *     description: Devuelve una lista de todos los proyectos del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
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
router.get("/", authMiddleware, getProjects);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Obtener un proyecto por ID
 *     description: Devuelve los detalles de un proyecto específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalles del proyecto obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *                   example: "No tiene permisos para acceder a este proyecto"
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Proyecto no encontrado"
 */
router.get("/:id", authMiddleware, validatorGetProject, getProject);

/**
 * @openapi
 * /api/projects/{id}:
 *   put:
 *     tags:
 *       - Projects
 *     summary: Actualizar un proyecto
 *     description: Actualiza la información de un proyecto existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a actualizar
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
 *                 example: "Desarrollo de aplicación web - Fase 2"
 *               description:
 *                 type: string
 *                 example: "Continuación del desarrollo con nuevas funcionalidades"
 *               status:
 *                 type: string
 *                 enum: [active, completed, on-hold, cancelled]
 *                 example: "active"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-06-01T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-30T00:00:00.000Z"
 *               budget:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 15000
 *                   currency:
 *                     type: string
 *                     example: "EUR"
 *               hourlyRate:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 60
 *                   currency:
 *                     type: string
 *                     example: "EUR"
 *     responses:
 *       200:
 *         description: Proyecto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *                   example: "No tiene permisos para modificar este proyecto"
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Proyecto no encontrado"
 */
router.put(
  "/:id",
  authMiddleware,
  validatorGetProject,
  validatorUpdateProject,
  updateProject
);

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Eliminar un proyecto permanentemente
 *     description: Elimina un proyecto de forma permanente del sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a eliminar
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyecto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Proyecto eliminado correctamente"
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
 *                   example: "No tiene permisos para eliminar este proyecto"
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Proyecto no encontrado"
 */
router.delete("/:id", authMiddleware, validatorGetProject, deleteProject);

/**
 * @openapi
 * /api/projects/{id}/soft:
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Archivar un proyecto (soft delete)
 *     description: Realiza una eliminación lógica del proyecto (lo marca como eliminado sin borrarlo)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a archivar
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyecto archivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Proyecto archivado correctamente"
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
 *                   example: "No tiene permisos para archivar este proyecto"
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Proyecto no encontrado"
 */
router.delete(
  "/:id/soft",
  authMiddleware,
  validatorGetProject,
  softDeleteProject
);

/**
 * @openapi
 * /api/projects/archived:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Obtener proyectos archivados
 *     description: Devuelve una lista de todos los proyectos archivados (soft deleted) del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
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
router.get("/archived", authMiddleware, getArchivedProjects);

/**
 * @openapi
 * /api/projects/{id}/restore:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Restaurar un proyecto archivado
 *     description: Restaura un proyecto previamente archivado (soft deleted)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a restaurar
 *         example: "60d21b4667d0d8992e610c85"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyecto restaurado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *                   example: "No tiene permisos para restaurar este proyecto"
 *       404:
 *         description: Proyecto archivado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Proyecto archivado no encontrado"
 */
router.post(
  "/:id/restore",
  authMiddleware,
  validatorGetProject,
  restoreProject
);

module.exports = router;
