// --- VALIDA LOS ERRORES --- //

const { validationResult } = require("express-validator");

// En el caso de tener errores en las peticiones, se avisa al cliente.
const validateResults = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (err) {
    res.status(403);
    res.send({ errors: err.array() });
  }
};

module.exports = validateResults;
