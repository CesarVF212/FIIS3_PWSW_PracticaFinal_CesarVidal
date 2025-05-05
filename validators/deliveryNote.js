// --- VALIDADOR PARA LOS ALBARANES --- //

const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

// Validador para introducir una mano de obra.
const validatorLaborEntry = [
  check("labor.*.person.name")
    .exists()
    .notEmpty()
    .isLength({ min: 2, max: 100 }),
  check("labor.*.person.role").optional().isString(),
  check("labor.*.hours").exists().notEmpty().isNumeric(),
  check("labor.*.rate.amount").optional().isNumeric(),
  check("labor.*.rate.currency").optional().isLength({ min: 3, max: 3 }),
  check("labor.*.date").optional().isISO8601(),
  check("labor.*.description").optional().isString(),
];

// Validator para introducir un material.
const validatorMaterialEntry = [
  check("materials.*.name").exists().notEmpty().isLength({ min: 2, max: 100 }),
  check("materials.*.quantity").exists().notEmpty().isNumeric(),
  check("materials.*.unit").optional().isString(),
  check("materials.*.price.amount").optional().isNumeric(),
  check("materials.*.price.currency").optional().isLength({ min: 3, max: 3 }),
  check("materials.*.description").optional().isString(),
];

// Validador para crear un albarán.
const validatorCreateDeliveryNote = [
  check("project").exists().notEmpty().isMongoId(),
  check("client").exists().notEmpty().isMongoId(),
  check("date").optional().isISO8601(),
  check("notes").optional().isString(),
  ...validatorLaborEntry,
  ...validatorMaterialEntry,
  (req, res, next) => validateResults(req, res, next),
];

// Validador para actualizar un albarán.
const validatorUpdateDeliveryNote = [
  check("date").optional().isISO8601(),
  check("notes").optional().isString(),
  ...validatorLaborEntry,
  ...validatorMaterialEntry,
  (req, res, next) => validateResults(req, res, next),
];

// Validador para obtener un albarán por su ID.
const validatorGetDeliveryNote = [
  check("id").exists().notEmpty().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para firmar un albarán.
const validatorSignDeliveryNote = [
  check("id").exists().notEmpty().isMongoId(),
  check("signedBy").exists().notEmpty().isString(),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = {
  validatorCreateDeliveryNote,
  validatorUpdateDeliveryNote,
  validatorGetDeliveryNote,
  validatorSignDeliveryNote,
};
