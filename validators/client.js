// --- VALIDADOR PARA LOS CLIENTES --- //

const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

// Validador para crear un cliente.
const validatorCreateClient = [
  check("name").exists().notEmpty().isLength({ min: 2, max: 100 }),
  check("email").optional().isEmail(),
  check("phone").optional().isLength({ min: 5, max: 20 }),
  check("contact.name").optional().isLength({ min: 2, max: 100 }),
  check("contact.position").optional().isLength({ min: 2, max: 100 }),
  check("contact.email").optional().isEmail(),
  check("contact.phone").optional().isLength({ min: 5, max: 20 }),
  check("address.street").optional().isLength({ min: 5, max: 100 }),
  check("address.city").optional().isLength({ min: 2, max: 50 }),
  check("address.state").optional().isLength({ min: 2, max: 50 }),
  check("address.country").optional().isLength({ min: 2, max: 50 }),
  check("address.postalCode").optional().isLength({ min: 3, max: 10 }),
  check("taxId").optional().isLength({ min: 5, max: 20 }),
  check("notes").optional().isString(),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para actualizar un cliente.
const validatorUpdateClient = [
  check("name").optional().isLength({ min: 2, max: 100 }),
  check("email").optional().isEmail(),
  check("phone").optional().isLength({ min: 5, max: 20 }),
  check("contact.name").optional().isLength({ min: 2, max: 100 }),
  check("contact.position").optional().isLength({ min: 2, max: 100 }),
  check("contact.email").optional().isEmail(),
  check("contact.phone").optional().isLength({ min: 5, max: 20 }),
  check("address.street").optional().isLength({ min: 5, max: 100 }),
  check("address.city").optional().isLength({ min: 2, max: 50 }),
  check("address.state").optional().isLength({ min: 2, max: 50 }),
  check("address.country").optional().isLength({ min: 2, max: 50 }),
  check("address.postalCode").optional().isLength({ min: 3, max: 10 }),
  check("taxId").optional().isLength({ min: 5, max: 20 }),
  check("notes").optional().isString(),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para obtener un cliente por su ID.
const validatorGetClient = [
  check("id").exists().notEmpty().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = {
  validatorCreateClient,
  validatorUpdateClient,
  validatorGetClient,
};
