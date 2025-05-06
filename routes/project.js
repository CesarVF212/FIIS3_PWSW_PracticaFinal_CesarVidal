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

// Crear un nuevo proyecto.
//   RESPUESTA:
//     200: Proyecto creado exitosamente.
//     400: Datos de entrada no válidos.
//     401: No autorizado.
//     403: Prohibido.
//     404: Cliente no encontrado.
//     409: El proyecto ya existe.
router.post(
  "/",
  authMiddleware,
  verifiedMiddleware,
  validatorCreateProject,
  createProject
);

// Obtener todos los proyectos.
//   RESPUESTA:
//     200: Lista de proyectos.
//     401: No autorizado.
router.get("/", authMiddleware, getProjects);

// Obtener un proyecto por ID.
//   RESPUESTA:
//     200: Detalles del proyecto.
//     401: No autorizado.
//     403: Prohibido.
//     404: Proyecto no encontrado.
router.get("/:id", authMiddleware, validatorGetProject, getProject);

// Actualizar un proyecto.
//   RESPUESTA:
//     200: Proyecto actualizado exitosamente.
//     400: Datos de entrada no válidos.
//     401: No autorizado.
//     403: Prohibido.
//     404: Proyecto no encontrado.
router.put(
  "/:id",
  authMiddleware,
  validatorGetProject,
  validatorUpdateProject,
  updateProject
);

// Eliminar un proyecto (eliminación permanente).
//   RESPUESTA:
//     200: Proyecto eliminado exitosamente.
//     401: No autorizado.
//     403: Prohibido.
//     404: Proyecto no encontrado.
router.delete("/:id", authMiddleware, validatorGetProject, deleteProject);

// Eliminar un proyecto (eliminación lógica).
//   RESPUESTA:
//     200: Proyecto eliminado lógicamente exitosamente.
//     401: No autorizado.
//     403: Prohibido.
//     404: Proyecto no encontrado.
router.delete(
  "/:id/soft",
  authMiddleware,
  validatorGetProject,
  softDeleteProject
);

// Obtener proyectos archivados.
//   RESPUESTA:
//     200: Lista de proyectos archivados.
//     401: No autorizado.
router.get("/archived", authMiddleware, getArchivedProjects);

// Restaurar un proyecto archivado.
//   RESPUESTA:
//     200: Proyecto restaurado exitosamente.
//     401: No autorizado.
//     403: Prohibido.
//     404: Proyecto archivado no encontrado.
router.post(
  "/:id/restore",
  authMiddleware,
  validatorGetProject,
  restoreProject
);

module.exports = router;
