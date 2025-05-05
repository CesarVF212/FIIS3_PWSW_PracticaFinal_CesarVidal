// --- VALIDADOR PARA LAS EMPRESAS --- //

const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

// Validador para crear o actualizar una empresa.
const validatorCompany = [
  check("name").exists().notEmpty().isLength({ min: 2, max: 100 }),
  check("legalName").optional().isLength({ min: 2, max: 100 }),
  check("taxId").optional().isLength({ min: 5, max: 20 }),
  check("email").optional().isEmail(),
  check("phone").optional().isLength({ min: 5, max: 20 }),
  check("address.street").optional().isLength({ min: 5, max: 100 }),
  check("address.city").optional().isLength({ min: 2, max: 50 }),
  check("address.state").optional().isLength({ min: 2, max: 50 }),
  check("address.country").optional().isLength({ min: 2, max: 50 }),
  check("address.postalCode").optional().isLength({ min: 3, max: 10 }),
  check("website").optional().isURL(),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para obtener una empresa por su ID.
const validatorGetCompany = [
  check("id").exists().notEmpty().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = {
  validatorCompany,
  validatorGetCompany,
};
