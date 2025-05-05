// --- CONTROLADOR DEL CLIENTE --- //
// Se encarga de abstraernos de la lógica de sql.

const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");
const { clientModel } = require("../models");

// Crear un nuevo cliente.
const createClient = async (req, res) => {
  try {
    const body = matchedData(req);
    const { user } = req;

    // Miramos si el cliente ya existe.
    const query = {
      name: body.name,
      $or: [{ user: user._id }],
    };

    // Añadimos la empresa a la query si el usuario tiene una empresa.
    if (user.company) {
      query.$or.push({ company: user.company });
    }

    // Revisamos si el cliente ya existe.
    const clientExists = await clientModel.findOne(query);

    // En el caso de que lo haga, devolvemos un error.
    if (clientExists) {
      handleHttpError(res, "CLIENT_ALREADY_EXISTS", 409);
      return;
    }

    // Creamos el cliente con los datos del body y el ID del usuario.
    const clientData = {
      ...body,
      user: user._id,
    };

    // Si tiene una empresa, la añadimos a los datos del cliente.
    if (user.company) {
      clientData.company = user.company;
    }

    // Ahora creamos todo en la base de datos.
    const client = await clientModel.create(clientData);

    res.send(client);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_CREATE_CLIENT");
  }
};

// Obtenemos todos los clientes del usuario o de la empresa.
const getClients = async (req, res) => {
  try {
    const { user } = req;

    const query = {
      $or: [{ user: user._id }],
    };

    // Añadimos la empresa a la query si el usuario tiene una empresa.
    if (user.company) {
      query.$or.push({ company: user.company });
    }

    // Lanzamos la querty a la base de datos y la devolvemos.
    const clients = await clientModel.find(query);

    res.send(clients);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GET_CLIENTS");
  }
};

// Obtenemos un cliente por ID.
const getClient = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    const client = await clientModel.findById(id);

    // Si no existe el cliente, devolvemos un error.
    if (!client) {
      handleHttpError(res, "CLIENT_NOT_FOUND", 404);
      return;
    }

    // Revisamos si el cliente pertenece al usuario o a la empresa del usuario.
    const isAuthorized =
      client.user.toString() === user._id.toString() ||
      (user.company &&
        client.company &&
        client.company.toString() === user.company.toString());

    // Si no existe, no esta autorizado a ver el cliente.
    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_VIEW_CLIENT", 403);
      return;
    }

    res.send(client);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GET_CLIENT");
  }
};

// Actualizar un cliente.
const updateClient = async (req, res) => {
  try {
    const { id, ...body } = matchedData(req);
    const { user } = req;

    const client = await clientModel.findById(id);

    // Lanzamos el error si no existe.
    if (!client) {
      handleHttpError(res, "CLIENT_NOT_FOUND", 404);
      return;
    }

    // Revisamos si el cliente pertenece al usuario o a la empresa del usuario.
    const isAuthorized =
      client.user.toString() === user._id.toString() ||
      (user.company &&
        client.company &&
        client.company.toString() === user.company.toString());

    // Si no está autorizado, lanzamos un error.
    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_UPDATE_CLIENT", 403);
      return;
    }

    // Actualizamos el cliente.
    const updatedClient = await clientModel.findByIdAndUpdate(id, body, {
      new: true,
    });

    res.send(updatedClient);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_UPDATE_CLIENT");
  }
};

// Borrado completo de un cliente.
const deleteClient = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    const client = await clientModel.findById(id);

    // Si no existe el cliente, lanzamos un error.
    if (!client) {
      handleHttpError(res, "CLIENT_NOT_FOUND", 404);
      return;
    }

    // Revisamos si el cliente pertenece al usuario o a la empresa del usuario.
    const isAuthorized =
      client.user.toString() === user._id.toString() ||
      (user.company &&
        client.company &&
        client.company.toString() === user.company.toString());

    // Si no está autorizado, lanzamos un error.
    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_DELETE_CLIENT", 403);
      return;
    }

    // Borrado DUROOOOOOO.
    await clientModel.findByIdAndDelete(id);

    res.send({ message: "CLIENT_DELETED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_DELETE_CLIENT");
  }
};

// Borrado lógico del cliente.
const softDeleteClient = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    const client = await clientModel.findById(id);

    // Si no existe el cliente, lanzamos un error.
    if (!client) {
      handleHttpError(res, "CLIENT_NOT_FOUND", 404);
      return;
    }

    // Revisamos si el cliente pertenece al usuario o a la empresa del usuario.
    const isAuthorized =
      client.user.toString() === user._id.toString() ||
      (user.company &&
        client.company &&
        client.company.toString() === user.company.toString());

    // Si no está autorizado, lanzamos un error.
    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_DELETE_CLIENT", 403);
      return;
    }

    // Borrado LÓGICO.
    await clientModel.delete({ _id: id });

    res.send({ message: "CLIENT_SOFT_DELETED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_SOFT_DELETE_CLIENT");
  }
};

// Obtener todos los clientes archivados del usuario o de la empresa.
const getArchivedClients = async (req, res) => {
  try {
    const { user } = req;

    const query = {
      $or: [{ user: user._id }],
    };

    // Añade la empresa a la query si el usuario tiene una empresa.
    if (user.company) {
      query.$or.push({ company: user.company });
    }

    // Lanzamos la query a la base de datos y la devolvemos.
    const archivedClients = await clientModel.findDeleted(query);

    res.send(archivedClients);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GET_ARCHIVED_CLIENTS");
  }
};

// Desarchivar un cliente.
const restoreClient = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    // Obtemeos el cliente archivado por ID.
    const client = await clientModel.findOneDeleted({ _id: id });

    // Si no existe el cliente, lanzamos un error.
    if (!client) {
      handleHttpError(res, "ARCHIVED_CLIENT_NOT_FOUND", 404);
      return;
    }

    // Revisamos si el cliente pertenece al usuario o a la empresa del usuario.
    const isAuthorized =
      client.user.toString() === user._id.toString() ||
      (user.company &&
        client.company &&
        client.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_RESTORE_CLIENT", 403);
      return;
    }

    // Restauramos el cliente, ya que ha sido un borrado lógico no completo.
    await clientModel.restore({ _id: id });

    // Obtenemos y devomveos el cliente restaurado.
    const restoredClient = await clientModel.findById(id);

    res.send({
      message: "CLIENT_RESTORED_SUCCESSFULLY",
      client: restoredClient,
    });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_RESTORE_CLIENT");
  }
};

module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  softDeleteClient,
  getArchivedClients,
  restoreClient,
};
