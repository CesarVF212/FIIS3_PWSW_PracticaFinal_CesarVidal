// --- VALIDADOR DE DATOS PARA LOS USUARIOS --- //

const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorRegister = [
  check("name").exists().notEmpty().isLength({ min: 3, max: 99 }),
  check("email").exists().notEmpty().isEmail(),
  check("password")
    .exists()
    .notEmpty()
    .isLength({ min: 8, max: 32 })
    // Verifica lo que tiene que contener la contraseña. Se lo he pedido a la IA por que no entiendo que esta cadena.
    // Me imagino que significa que exactamente pueden tener las contraseñas y símbolos permitidos.
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para hacer un login.
const validatorLogin = [
  check("email").exists().notEmpty().isEmail(),
  check("password").exists().notEmpty().isLength({ min: 8, max: 32 }),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para verificar el código de verificación del email.
const validatorVerification = [
  check("code").exists().notEmpty().isLength({ min: 6, max: 6 }),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para restablecer la contraseña.
const validatorPasswordReset = [
  check("email").exists().notEmpty().isEmail(),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para cambiar la contraseña.
const validatorPasswordChange = [
  check("currentPassword").exists().notEmpty(),
  check("newPassword")
    .exists()
    .notEmpty()
    .isLength({ min: 8, max: 32 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para cambiar la contraseña después de haberla olvidado.
const validatorSetNewPassword = [
  check("email").exists().notEmpty().isEmail(),
  check("code").exists().notEmpty().isLength({ min: 6, max: 6 }),
  check("password")
    .exists()
    .notEmpty()
    .isLength({ min: 8, max: 32 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  (req, res, next) => validateResults(req, res, next),
];

// Validator para cambiar algo de información del usuario.
const validatorUpdatePersonalInfo = [
  check("personalInfo.firstName").optional().isLength({ min: 2, max: 50 }),
  check("personalInfo.lastName").optional().isLength({ min: 2, max: 50 }),
  check("personalInfo.phone").optional().isLength({ min: 5, max: 20 }),
  check("personalInfo.address").optional().isLength({ min: 5, max: 100 }),
  check("personalInfo.city").optional().isLength({ min: 2, max: 50 }),
  check("personalInfo.country").optional().isLength({ min: 2, max: 50 }),
  check("personalInfo.postalCode").optional().isLength({ min: 3, max: 10 }),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para obtener un usuario por su id.
const validatorGetUser = [
  check("id").exists().notEmpty().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

// Validador para obtener invitar a un usuario.
const validatorInviteUser = [
  check("email").exists().notEmpty().isEmail(),
  check("role").optional().isIn(["user", "admin"]),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = {
  validatorRegister,
  validatorLogin,
  validatorVerification,
  validatorPasswordReset,
  validatorPasswordChange,
  validatorSetNewPassword,
  validatorUpdatePersonalInfo,
  validatorGetUser,
  validatorInviteUser,
};
