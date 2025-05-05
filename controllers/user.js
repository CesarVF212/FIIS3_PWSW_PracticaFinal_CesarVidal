// --- CONTROLADOR DEL USUARIO --- //
// Se encarga de abstraernos de la lógica de sql.

const { matchedData } = require("express-validator");
const { encrypt, compare } = require("../utils/handlePassword");
const { tokenSign } = require("../utils/handleJWT");
const { handleHttpError } = require("../utils/handleError");
const { userModel, companyModel } = require("../models");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/handleEmail");
const crypto = require("crypto");

// Genera el código de verificación para registro y restablecimiento de contraseña.
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Registrar un nuevo usuario.
const registerUser = async (req, res) => {
  try {
    req = matchedData(req);

    // Revisa antes que el usuario no exista.
    const userExists = await userModel.findOne({ email: req.email });
    if (userExists) {
      handleHttpError(res, "USER_ALREADY_EXISTS", 409);
      return;
    }

    // Encripta la contraseña antes de guardarla en la base de datos.
    const hashPassword = await encrypt(req.password);

    // Genera el código de verificación y la fecha de expiración.
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date();
    // Hacemos que sea de 24 horas.
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Ahora con todo esto, asignamos los datos.
    const body = {
      ...req,
      password: hashPassword,
      verificationCode,
      verificationExpires,
    };

    // Y lo guardamos siguiendo el modelo de usuario.
    const dataUser = await userModel.create(body);

    // Enviamos el código de verificación al email del usuario.
    await sendVerificationEmail(dataUser.email, verificationCode);

    // No devolvemos la contraseña ni el código de verificación en la respuesta.
    dataUser.set("password", undefined, { strict: false });
    dataUser.set("verificationCode", undefined, { strict: false });
    dataUser.set("verificationExpires", undefined, { strict: false });

    // Una vez todo esto, generamos el token de acceso para el usuario.
    const token = await tokenSign(dataUser);

    // En la respuesta final, devolvemos el token y los datos del usuario.
    res.send({
      token,
      user: dataUser,
    });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_REGISTER_USER");
  }
};

// Función para validar el email del usuario después de registrarse.
const validateEmail = async (req, res) => {
  try {
    const { code } = matchedData(req);
    const { user } = req;

    // Revisamos si el usuario ya está verificado.
    if (user.verified) {
      handleHttpError(res, "USER_ALREADY_VERIFIED", 400);
      return;
    }

    // Verificamos que el código de verificación sea correcto.
    if (user.verificationCode !== code) {
      handleHttpError(res, "INVALID_VERIFICATION_CODE", 400);
      return;
    }

    // Verificamos que el código no haya expirado.
    if (new Date() > new Date(user.verificationExpires)) {
      handleHttpError(res, "VERIFICATION_CODE_EXPIRED", 400);
      return;
    }

    // Actualizamos los datos del usuario para marcarlo como verificado.
    user.verified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    // Devolvemos una respuesta de éxito.
    res.send({ message: "USER_VERIFIED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_VALIDATING_USER");
  }
};

// Iniciar sesión de usuario.
const loginUser = async (req, res) => {
  try {
    req = matchedData(req);

    // Encontramos el usuario por email.
    const user = await userModel
      .findOne({ email: req.email })
      .select("password email name role verified company");

    // En caso de que no exista, devolvemos un error.
    if (!user) {
      handleHttpError(res, "USER_NOT_EXISTS", 404);
      return;
    }

    // Comparamos la contraseña puesta con la base de datos tras decofrificarla.
    const hashPassword = user.password;
    const check = await compare(req.password, hashPassword);

    // Si esta verificación falla, devolvemos un error.
    if (!check) {
      handleHttpError(res, "PASSWORD_INVALID", 401);
      return;
    }

    // Y nos aseguramos de no devolver la contraseña en la respuesta.
    user.set("password", undefined, { strict: false });

    // Generamos el token de acceso para el usuario.
    const token = await tokenSign(user);

    // Devolvemos el token y los datos del usuario.
    res.send({
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_LOGIN_USER");
  }
};

// Obtenemos un usuario de la base de datos.
const getUser = async (req, res) => {
  try {
    const { user } = req;

    // Obtenemos el usuario de la base de datos.
    const userData = await userModel
      .findById(user._id)
      // Eliminamos los campos sensibles.
      .select(
        "-password -verificationCode -verificationExpires -passwordResetCode -passwordResetExpires"
      )
      .populate("company");

    res.send(userData);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GET_USER");
  }
};

// Función para actualizar los datos del usuario.
const updateUser = async (req, res) => {
  try {
    const body = matchedData(req);
    const { user } = req;

    // Usamos directamente este tipo de consulta sql.
    // También evitamos que el usuario pueda cambiar cosas sensibles como rol o contraseña.
    const userData = await userModel
      .findByIdAndUpdate(user._id, body, { new: true })
      .select(
        "-password -verificationCode -verificationExpires -passwordResetCode -passwordResetExpires"
      );

    res.send(userData);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_UPDATE_USER");
  }
};

// Función para actualizar los datos de la empresa del usuario.
const updateCompany = async (req, res) => {
  try {
    const body = matchedData(req);
    const { user } = req;

    // Revisamos que el usuario tenga una empresa asociada.
    if (!user.company) {
      // En caso de que no tenga, creamos una nueva empresa.
      const companyData = {
        ...body,
        owner: user._id,
        members: [user._id],
      };

      // Llamamos al modelo de empresa para crearla.
      const newCompany = await companyModel.create(companyData);

      // Cambiamos el modelo y le pasamos una referencia a la empresa con el _id.
      await userModel.findByIdAndUpdate(
        user._id,
        { company: newCompany._id },
        { new: true }
      );

      res.send(newCompany);
    } else {
      // En caso de que ya tenga una empresa, la actualizamos.
      const company = await companyModel.findById(user.company);

      // Revisamos que la empresa exista.
      if (!company) {
        handleHttpError(res, "COMPANY_NOT_FOUND", 404);
        return;
      }

      // Revisamos que el usuario sea el dueño de la empresa o un admin.
      if (
        company.owner.toString() !== user._id.toString() &&
        user.role !== "admin"
      ) {
        handleHttpError(res, "NOT_AUTHORIZED_TO_UPDATE_COMPANY", 403);
        return;
      }

      // Actualizamos la empresa con el modelo de la empresa.
      const updatedCompany = await companyModel.findByIdAndUpdate(
        user.company,
        body,
        { new: true }
      );

      res.send(updatedCompany);
    }
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_UPDATE_COMPANY");
  }
};

// Función para solicitar un restablecimiento de contraseña.
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = matchedData(req);

    // Encontramos al usuario por email.
    const user = await userModel.findOne({ email });

    if (!user) {
      // Miramos si el usuario existe o no, pero no devolvemos.
      res.send({ message: "PASSWORD_RESET_EMAIL_SENT_IF_USER_EXISTS" });
      return;
    }

    // Generamos el código de restablecimiento y la fecha de expiración.
    const resetCode = generateVerificationCode();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiration

    // Actualizamos el usuario con el nuevo código y la fecha de expiración.
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Enviamos el email.
    await sendPasswordResetEmail(user.email, resetCode);

    res.send({ message: "PASSWORD_RESET_EMAIL_SENT_IF_USER_EXISTS" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_REQUEST_PASSWORD_RESET");
  }
};

// Función para establecer una nueva contraseña después de la verificación.
const setNewPassword = async (req, res) => {
  try {
    const { email, code, password } = matchedData(req);

    // Encontramos al usuario por email.
    const user = await userModel.findOne({ email });

    // Si no existe, devolvemos un error.
    if (!user) {
      handleHttpError(res, "USER_NOT_FOUND", 404);
      return;
    }

    // Miramos si el código de restablecimiento es correcto.
    if (user.passwordResetCode !== code) {
      handleHttpError(res, "INVALID_RESET_CODE", 400);
      return;
    }

    // Miramos que el código no haya expirado.
    if (new Date() > new Date(user.passwordResetExpires)) {
      handleHttpError(res, "RESET_CODE_EXPIRED", 400);
      return;
    }

    // Nueva contraseña encriptada.
    const hashPassword = await encrypt(password);

    // Lo actualizamos.
    user.password = hashPassword;
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save();

    res.send({ message: "PASSWORD_RESET_SUCCESSFUL" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_SET_NEW_PASSWORD");
  }
};

// Función para cambiar la contraseña del usuario.
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = matchedData(req);
    const { user } = req;

    // Obtenemos la contraseña.
    const userData = await userModel.findById(user._id).select("password");

    // Vemos si la contraseña es correcta.
    const check = await compare(currentPassword, userData.password);

    // Si no es correcta, devolvemos un error. Estamos cambiando la contraseña en el caso de saberla.
    if (!check) {
      handleHttpError(res, "CURRENT_PASSWORD_INVALID", 401);
      return;
    }

    // La encriptamos y la actualizamos.
    const hashPassword = await encrypt(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashPassword });

    res.send({ message: "PASSWORD_CHANGED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_CHANGE_PASSWORD");
  }
};

// Eliminar un usuario de la base de datos.
const deleteUser = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    // Solo permite que administradores o el propio usuario eliminen su cuenta.
    if (id !== user._id.toString() && user.role !== "admin") {
      handleHttpError(res, "NOT_AUTHORIZED_TO_DELETE_USER", 403);
      return;
    }

    // Elimianción completa de la base de datos.
    await userModel.findByIdAndDelete(id);

    res.send({ message: "USER_DELETED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_DELETE_USER");
  }
};

// Eliminar un usuario de la base de datos (soft delete).
const softDeleteUser = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    // Solo permite que administradores o el propio usuario eliminen su cuenta.
    if (id !== user._id.toString() && user.role !== "admin") {
      handleHttpError(res, "NOT_AUTHORIZED_TO_DELETE_USER", 403);
      return;
    }

    // Eliminación lógica del usuario (soft delete).
    await userModel.delete({ _id: id });

    res.send({ message: "USER_SOFT_DELETED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_SOFT_DELETE_USER");
  }
};

// Invitar a un nuevo usuario a la empresa.
const inviteUser = async (req, res) => {
  try {
    const { email, role = "user" } = matchedData(req);
    const { user } = req;

    // Revisar que el usuario tenga una empresa asociada.
    if (!user.company) {
      handleHttpError(res, "USER_HAS_NO_COMPANY", 400);
      return;
    }

    // Obtenemos la empresa del usuario.
    const company = await companyModel.findById(user.company);

    // Revisamos que sea dueño o administrados para poder enviar una invitación.
    if (
      company.owner.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_INVITE", 403);
      return;
    }

    // Enviamos el token de invitación.
    const token = crypto.randomBytes(20).toString("hex");

    // Y creamos la invitación en la base de datos.
    const invitation = await invitationModel.create({
      email,
      company: company._id,
      invitedBy: user._id,
      role,
      token,
    });

    // Generamos el enlace de invitación.
    const inviteLink = `${process.env.PUBLIC_URL}/api/user/accept-invitation/${token}`;

    // Y la enviamos por correo.
    await sendInvitationEmail(email, company.name, inviteLink);

    res.send({
      message: "INVITATION_SENT_SUCCESSFULLY",
      invitation,
    });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_INVITE_USER");
  }
};

module.exports = {
  registerUser,
  validateEmail,
  loginUser,
  getUser,
  updateUser,
  updateCompany,
  requestPasswordReset,
  setNewPassword,
  changePassword,
  deleteUser,
  softDeleteUser,
  inviteUser,
};
