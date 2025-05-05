// --- CONTROLADOR DEL PROYECTO --- //
// Se encarga de gestionar la lógica relacionada con los proyectos.

const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");
const { projectModel, clientModel } = require("../models");

// Crear un nuevo proyecto.
const createProject = async (req, res) => {
  try {
    const body = matchedData(req);
    const { user } = req;

    // Buscamos el cliente al que se le quiere asociar el proyecto.
    const client = await clientModel.findById(body.client);

    // Si no existe el cliente, devolvemos error.
    if (!client) {
      handleHttpError(res, "CLIENT_NOT_FOUND", 404);
      return;
    }

    // Comprobamos si el usuario tiene permiso sobre ese cliente (por ser suyo o de su empresa).
    const isAuthorized =
      client.user.toString() === user._id.toString() ||
      (user.company &&
        client.company &&
        client.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_CREATE_PROJECT_FOR_CLIENT", 403);
      return;
    }

    // Comprobamos si ya existe un proyecto con el mismo nombre para ese cliente.
    const projectExists = await projectModel.findOne({
      name: body.name,
      client: body.client,
    });

    if (projectExists) {
      handleHttpError(res, "PROJECT_ALREADY_EXISTS", 409);
      return;
    }

    // Creamos el proyecto con los datos del body y el usuario.
    const projectData = {
      ...body,
      user: user._id,
    };

    // Si el usuario pertenece a una empresa, también lo añadimos.
    if (user.company) {
      projectData.company = user.company;
    }

    // Creamos el proyecto en la base de datos.
    const project = await projectModel.create(projectData);

    res.send(project);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_CREATE_PROJECT");
  }
};

// Obtener todos los proyectos del usuario o de su empresa.
const getProjects = async (req, res) => {
  try {
    const { user } = req;

    const query = {
      $or: [{ user: user._id }],
    };

    // Añadimos la empresa a la query si el usuario tiene una.
    if (user.company) {
      query.$or.push({ company: user.company });
    }

    const projects = await projectModel.find(query);

    res.send(projects);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GET_PROJECTS");
  }
};

// Obtener un único proyecto por ID.
const getProject = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    const project = await projectModel.findById(id);

    // Si no existe el proyecto, devolvemos error.
    if (!project) {
      handleHttpError(res, "PROJECT_NOT_FOUND", 404);
      return;
    }

    // Comprobamos si el usuario tiene acceso al proyecto.
    const isAuthorized =
      project.user.toString() === user._id.toString() ||
      (user.company &&
        project.company &&
        project.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_VIEW_PROJECT", 403);
      return;
    }

    res.send(project);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GET_PROJECT");
  }
};

// Actualizar un proyecto.
const updateProject = async (req, res) => {
  try {
    const { id, ...body } = matchedData(req);
    const { user } = req;

    const project = await projectModel.findById(id);

    if (!project) {
      handleHttpError(res, "PROJECT_NOT_FOUND", 404);
      return;
    }

    const isAuthorized =
      project.user.toString() === user._id.toString() ||
      (user.company &&
        project.company &&
        project.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_UPDATE_PROJECT", 403);
      return;
    }

    const updatedProject = await projectModel.findByIdAndUpdate(id, body, {
      new: true,
    });

    res.send(updatedProject);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_UPDATE_PROJECT");
  }
};

// Borrar un proyecto.
const deleteProject = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    const project = await projectModel.findById(id);

    if (!project) {
      handleHttpError(res, "PROJECT_NOT_FOUND", 404);
      return;
    }

    const isAuthorized =
      project.user.toString() === user._id.toString() ||
      (user.company &&
        project.company &&
        project.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_DELETE_PROJECT", 403);
      return;
    }

    await projectModel.findByIdAndDelete(id);

    res.send({ message: "PROJECT_DELETED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_DELETE_PROJECT");
  }
};

// Archivado lógico de un proyecto (soft delete).
const softDeleteProject = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    const project = await projectModel.findById(id);

    if (!project) {
      handleHttpError(res, "PROJECT_NOT_FOUND", 404);
      return;
    }

    const isAuthorized =
      project.user.toString() === user._id.toString() ||
      (user.company &&
        project.company &&
        project.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_DELETE_PROJECT", 403);
      return;
    }

    // Marcamos el proyecto como archivado.
    project.archived = true;
    await project.save();

    res.send({ message: "PROJECT_ARCHIVED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_SOFT_DELETE_PROJECT");
  }
};

// Obtener los proyectos archivados del usuario (y de su empresa si aplica).
const getArchivedProjects = async (req, res) => {
  try {
    const { user } = req;

    const query = {
      archived: true,
      $or: [{ user: user._id }],
    };

    if (user.company) {
      query.$or.push({ company: user.company });
    }

    const projects = await projectModel.find(query);

    res.send(projects);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GET_ARCHIVED_PROJECTS");
  }
};

// Restaurar un proyecto previamente archivado.
const restoreProject = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    const project = await projectModel.findById(id);

    if (!project) {
      handleHttpError(res, "PROJECT_NOT_FOUND", 404);
      return;
    }

    const isAuthorized =
      project.user.toString() === user._id.toString() ||
      (user.company &&
        project.company &&
        project.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_RESTORE_PROJECT", 403);
      return;
    }

    // Quitamos la marca de archivado.
    project.archived = false;
    await project.save();

    res.send({ message: "PROJECT_RESTORED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_RESTORE_PROJECT");
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  softDeleteProject,
  getArchivedProjects,
  restoreProject,
};
