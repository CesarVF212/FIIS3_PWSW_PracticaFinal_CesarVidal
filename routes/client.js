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

// Crear un nuevo cliente.
//   RESPUESTA:
//     200: Cliente creado exitosamente.
//     400: Datos de entrada no válidos.
//     401: No autorizado.
//     409: El cliente ya existe.
router.post(
  "/",
  authMiddleware,
  verifiedMiddleware,
  validatorCreateClient,
  createClient
);

// Obtener todos los clientes.
//   RESPUESTA:
//     200: Lista de clientes.
//     401: No autorizado.
router.get("/", authMiddleware, getClients);

// Obtener un cliente por ID.
//   RESPUESTA:
//     200: Detalles del cliente.
//     401: No autorizado.
//     403: Prohibido.
//     404: Cliente no encontrado.
router.get("/:id", authMiddleware, validatorGetClient, getClient);

// Actualizar un cliente.
//   RESPUESTA:
//     200: Cliente actualizado exitosamente.
//     400: Datos de entrada no válidos.
//     401: No autorizado.
//     403: Prohibido.
//     404: Cliente no encontrado.
router.put(
  "/:id",
  authMiddleware,
  validatorGetClient,
  validatorUpdateClient,
  updateClient
);

// Eliminar un cliente (eliminación permanente).
//   RESPUESTA:
//     200: Cliente eliminado exitosamente.
//     401: No autorizado.
//     403: Prohibido.
//     404: Cliente no encontrado.
router.delete("/:id", authMiddleware, validatorGetClient, deleteClient);

// Eliminar un cliente (eliminación lógica).
//   RESPUESTA:
//     200: Cliente eliminado lógicamente exitosamente.
//     401: No autorizado.
//     403: Prohibido.
//     404: Cliente no encontrado.
router.delete(
  "/:id/soft",
  authMiddleware,
  validatorGetClient,
  softDeleteClient
);

// Obtener clientes archivados.
//   RESPUESTA:
//     200: Lista de clientes archivados.
//     401: No autorizado.
router.get("/archived", authMiddleware, getArchivedClients);

// Restaurar un cliente archivado.
//   RESPUESTA:
//     200: Cliente restaurado exitosamente.
//     401: No autorizado.
//     403: Prohibido.
//     404: Cliente archivado no encontrado.
router.post("/:id/restore", authMiddleware, validatorGetClient, restoreClient);

module.exports = router;
