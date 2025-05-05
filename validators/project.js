// --- VALIDADOR PARA LOS PROYECTOS --- //

const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

// Validador para crear un proyecto.
const validatorCreateProject = [
  check("name").exists().notEmpty().isLength({ min: 2, max: 100 }),
  check("description").optional().isString(),
  check("client").exists().notEmpty().isMongoId(),
  check("status")
    .optional()
    .isIn(["active", "completed", "on-hold", "cancelled"]),
  check("startDate").optional().isISO8601(),
  check("endDate").optional().isISO8601(),
  check("budget.amount").optional().isNumeric(),
  check("budget.currency").optional().isLength({ min: 3, max: 3 }),
  check("hourlyRate.amount").optional().isNumeric(),
  check("hourlyRate.currency").optional().isLength({ min: 3, max: 3 }),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para actualizar un proyecto.
const validatorUpdateProject = [
  check("name").optional().isLength({ min: 2, max: 100 }),
  check("description").optional().isString(),
  check("status")
    .optional()
    .isIn(["active", "completed", "on-hold", "cancelled"]),
  check("startDate").optional().isISO8601(),
  check("endDate").optional().isISO8601(),
  check("budget.amount").optional().isNumeric(),
  check("budget.currency").optional().isLength({ min: 3, max: 3 }),
  check("hourlyRate.amount").optional().isNumeric(),
  check("hourlyRate.currency").optional().isLength({ min: 3, max: 3 }),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para obtener un proyecto por su ID.
const validatorGetProject = [
  check("id").exists().notEmpty().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = {
  validatorCreateProject,
  validatorUpdateProject,
  validatorGetProject,
};
