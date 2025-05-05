// --- VERIFICA SI EL USUARIO ES PROPIETARIO DE LA EMPRESA SOBRE LA QUE SE REALIZA LA PETICIÓN --- //

const { handleHttpError } = require("../utils/handleError");
const { companyModel } = require("../models");

const checkOwnership =
  (model, paramId = "id") =>
  async (req, res, next) => {
    try {
      // Obtenemos el usuario.
      const { user } = req;
      const resourceId = req.params[paramId];

      //  Verificamos la id del recurso.
      if (!resourceId) {
        handleHttpError(res, "ID_NOT_PROVIDED", 400);
        return;
      }

      // Obtenemos el modelo del recurso al que intenta acceder.
      const Model = require(`../models`)[model];

      if (!Model) {
        handleHttpError(res, "MODEL_NOT_FOUND", 500);
        return;
      }

      // Encontramos con la id el recurso concreto.
      const resource = await Model.findById(resourceId);

      // En el caso de que no exista, lanza un error.
      if (!resource) {
        handleHttpError(res, "RESOURCE_NOT_FOUND", 404);
        return;
      }

      // Ahora se revisa si el usuario es el propietario del recurso.
      if (resource.user && resource.user.toString() === user._id.toString()) {
        return next();
      }

      // Y se mira si ambos recursos están en la misma empresa de la que el usuario es dueño.
      if (resource.company && user.company) {
        if (resource.company.toString() === user.company.toString()) {
          // En caso de que esto se cumpla, deja continuar.
          return next();
        }

        if (user.role === "admin") {
          const company = await companyModel.findById(user.company);
          if (company && company.owner.toString() === user._id.toString()) {
            // En caso de que seas administrados, también te deja continuar.
            return next();
          }
        }
      }

      // Para el resto de los casos, lanza un error.
      handleHttpError(res, "PERMISSION_DENIED", 403);
    } catch (error) {
      console.error(error);
      handleHttpError(res, "OWNERSHIP_ERROR", 403);
    }
  };

module.exports = checkOwnership;
