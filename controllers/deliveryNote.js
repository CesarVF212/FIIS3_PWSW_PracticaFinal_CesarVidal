// --- CONTROLADOR DEL ALBARÁN --- //
// Se encarga de gestionar la lógica relacionada con los albaranes.

const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");
const {
  deliveryNoteModel,
  projectModel,
  clientModel,
  userModel,
  storageModel,
} = require("../models");
const { uploadToPinata, getIpfsUrl } = require("../utils/handleUploadIPFS");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Crear un nuevo albarán.
const createDeliveryNote = async (req, res) => {
  try {
    const body = matchedData(req);
    const { user } = req;

    // Revisar si el projecto exite y tenemos acceso a el.
    const project = await projectModel.findById(body.project);

    if (!project) {
      handleHttpError(res, "PROJECT_NOT_FOUND", 404);
      return;
    }

    // Revisar que pertenece a la compañía del usuario.
    const isProjectAuthorized =
      project.user.toString() === user._id.toString() ||
      (user.company &&
        project.company &&
        project.company.toString() === user.company.toString());

    if (!isProjectAuthorized) {
      handleHttpError(
        res,
        "NOT_AUTHORIZED_TO_CREATE_DELIVERY_NOTE_FOR_PROJECT",
        403
      );
      return;
    }

    // Revisa si se tiene acceso al cliente.
    const client = await clientModel.findById(body.client);

    if (!client) {
      handleHttpError(res, "CLIENT_NOT_FOUND", 404);
      return;
    }

    // Verifica si el cliente pertenece al usuario o su compañía.
    const isClientAuthorized =
      client.user.toString() === user._id.toString() ||
      (user.company &&
        client.company &&
        client.company.toString() === user.company.toString());

    if (!isClientAuthorized) {
      handleHttpError(
        res,
        "NOT_AUTHORIZED_TO_CREATE_DELIVERY_NOTE_FOR_CLIENT",
        403
      );
      return;
    }

    // Crea el albarán.
    const deliveryNoteData = {
      ...body,
      user: user._id,
    };

    // Añade al albarán la empresa si la hay.
    if (user.company) {
      deliveryNoteData.company = user.company;
    }

    const deliveryNote = await deliveryNoteModel.create(deliveryNoteData);

    res.send(deliveryNote);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_CREATE_DELIVERY_NOTE");
  }
};

// Obtiene todos los albaranes de un usuario o empresa.
const getDeliveryNotes = async (req, res) => {
  try {
    const { user } = req;

    const query = {
      $or: [{ user: user._id }],
    };

    // Añade la compañía a la query.
    if (user.company) {
      query.$or.push({ company: user.company });
    }

    // Obtiene la información relacionada a este albarán.
    const deliveryNotes = await deliveryNoteModel
      .find(query)
      .populate("project")
      .populate("client")
      .populate("user", "name email");

    res.send(deliveryNotes);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GET_DELIVERY_NOTES");
  }
};

// Obtiene un albarán dado su id.
const getDeliveryNote = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    // Lo obtiene dado su id y añade la información extra.
    const deliveryNote = await deliveryNoteModel
      .findById(id)
      .populate("project")
      .populate("client")
      .populate("user", "name email personalInfo company")
      .populate({
        path: "user",
        populate: {
          path: "company",
        },
      });

    // Se indica si no ha encontrado.
    if (!deliveryNote) {
      handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);
      return;
    }

    // Revisa si pertenece al usuario o la compañia.
    const isAuthorized =
      deliveryNote.user._id.toString() === user._id.toString() ||
      (user.company &&
        deliveryNote.company &&
        deliveryNote.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_VIEW_DELIVERY_NOTE", 403);
      return;
    }

    res.send(deliveryNote);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GET_DELIVERY_NOTE");
  }
};

// Actualiza un albarán.
const updateDeliveryNote = async (req, res) => {
  try {
    const { id, ...body } = matchedData(req);
    const { user } = req;

    // Lo obtiene por su id y revisa que exista.
    const deliveryNote = await deliveryNoteModel.findById(id);

    if (!deliveryNote) {
      handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);
      return;
    }

    // Revisa si pertenece al usuario os su compañia.
    const isAuthorized =
      deliveryNote.user.toString() === user._id.toString() ||
      (user.company &&
        deliveryNote.company &&
        deliveryNote.company.toString() === user.company.toString());

    // Si no está autorizado devuelve.
    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_UPDATE_DELIVERY_NOTE", 403);
      return;
    }

    // Mirar si ya está ya firmada. En ese caso no se puede actualizar.
    if (deliveryNote.status === "signed") {
      handleHttpError(res, "CANNOT_UPDATE_SIGNED_DELIVERY_NOTE", 400);
      return;
    }

    // Envía la query a actualizar en el caso de poder.
    const updatedDeliveryNote = await deliveryNoteModel
      .findByIdAndUpdate(id, body, { new: true })
      .populate("project")
      .populate("client")
      .populate("user", "name email");

    res.send(updatedDeliveryNote);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_UPDATE_DELIVERY_NOTE");
  }
};

// Elimina un albarán.
const deleteDeliveryNote = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    // Lo obtiene por su id.
    const deliveryNote = await deliveryNoteModel.findById(id);

    // En el caso de que no exista devuelve error.
    if (!deliveryNote) {
      handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);
      return;
    }

    // Revisa que pertenezca al usuario o su compañia.
    const isAuthorized =
      deliveryNote.user.toString() === user._id.toString() ||
      (user.company &&
        deliveryNote.company &&
        deliveryNote.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_DELETE_DELIVERY_NOTE", 403);
      return;
    }

    // Revisa que no esté ya firmada.
    if (deliveryNote.status === "signed") {
      handleHttpError(res, "CANNOT_DELETE_SIGNED_DELIVERY_NOTE", 400);
      return;
    }

    // La elimina.
    await deliveryNoteModel.findByIdAndDelete(id);

    res.send({ message: "DELIVERY_NOTE_DELETED_SUCCESSFULLY" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_DELETE_DELIVERY_NOTE");
  }
};

// Firma la nota.
const signDeliveryNote = async (req, res) => {
  try {
    const { id, signedBy } = matchedData(req);
    const { user } = req;
    const { file } = req;

    // Se debe enviar por parámetros un archivo para la firma.
    if (!file) {
      handleHttpError(res, "SIGNATURE_IMAGE_REQUIRED", 400);
      return;
    }

    // La obtiene por su id.
    const deliveryNote = await deliveryNoteModel.findById(id);

    if (!deliveryNote) {
      handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);
      return;
    }

    // Revisa que pertenezca al usuario o su compañia.
    const isAuthorized =
      deliveryNote.user.toString() === user._id.toString() ||
      (user.company &&
        deliveryNote.company &&
        deliveryNote.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_SIGN_DELIVERY_NOTE", 403);
      return;
    }

    // Revisa que no esté ya firmada.
    if (deliveryNote.status === "signed") {
      handleHttpError(res, "DELIVERY_NOTE_ALREADY_SIGNED", 400);
      return;
    }

    // Sube la imagen de la firma a IPFS (Piñata).
    const pinataResponse = await uploadToPinata(file.buffer, file.originalname);
    const ipfsHash = pinataResponse.IpfsHash;
    const signatureUrl = getIpfsUrl(ipfsHash);

    // Guarda la imagen.
    const storageData = {
      url: signatureUrl,
      filename: file.originalname,
      fileType: "signature",
      ipfsHash: ipfsHash,
      user: user._id,
      relatedTo: {
        model: "deliverynote",
        id: id,
      },
    };

    const storage = await storageModel.create(storageData);

    // Actualiza la firma en SQL con la información de la misma.
    deliveryNote.signatureImage = signatureUrl;
    deliveryNote.signedBy = signedBy;
    deliveryNote.signedAt = new Date();
    deliveryNote.status = "signed";
    await deliveryNote.save();

    // Subir el PDF.
    const pdfBuffer = await generateDeliveryNotePdf(deliveryNote._id);

    const pdfPinataResponse = await uploadToPinata(
      pdfBuffer,
      `delivery-note-${deliveryNote.number}.pdf`
    );
    const pdfIpfsHash = pdfPinataResponse.IpfsHash;
    const pdfUrl = getIpfsUrl(pdfIpfsHash);

    // Y guarda registro en memoria.
    const pdfStorageData = {
      url: pdfUrl,
      filename: `delivery-note-${deliveryNote.number}.pdf`,
      fileType: "pdf",
      ipfsHash: pdfIpfsHash,
      user: user._id,
      relatedTo: {
        model: "deliverynote",
        id: id,
      },
    };

    const pdfStorage = await storageModel.create(pdfStorageData);

    // La nota se sube con una url al pdf.
    deliveryNote.pdfUrl = pdfUrl;
    await deliveryNote.save();

    // Devolvemos la query del albarán con su información relacionada.
    const updatedDeliveryNote = await deliveryNoteModel
      .findById(id)
      .populate("project")
      .populate("client")
      .populate("user", "name email");

    res.send({
      message: "DELIVERY_NOTE_SIGNED_SUCCESSFULLY",
      deliveryNote: updatedDeliveryNote,
    });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_SIGN_DELIVERY_NOTE");
  }
};

// Genera el pdf de un albarán.
const generateDeliveryNotePdf = async (id) => {
  // Obtenemos toda la info.
  const deliveryNote = await deliveryNoteModel
    .findById(id)
    .populate("project")
    .populate("client")
    .populate("user", "name email personalInfo company")
    .populate({
      path: "user",
      populate: {
        path: "company",
      },
    });

  if (!deliveryNote) {
    throw new Error("DELIVERY_NOTE_NOT_FOUND");
  }

  // Creamos un nuevo documento pdf.
  const doc = new PDFDocument({ margin: 50 });

  // Creamos el buffer de escritura en pdf.
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // Añadimos el contenido al pdf.
  doc.fontSize(20).text("DELIVERY NOTE", { align: "center" });
  doc.moveDown();

  // Y algunos detalles.
  doc.fontSize(12).text(`Number: ${deliveryNote.number}`);
  doc.text(`Date: ${new Date(deliveryNote.date).toLocaleDateString()}`);
  doc.moveDown();

  // Información de la compañia y el cliente.
  doc.fontSize(14).text("Provider:", { underline: true });
  if (deliveryNote.user.company) {
    doc.fontSize(12).text(`${deliveryNote.user.company.name}`);
    if (deliveryNote.user.company.address) {
      const address = deliveryNote.user.company.address;
      doc.text(`${address.street || ""}`);
      doc.text(
        `${address.city || ""}, ${address.state || ""} ${
          address.postalCode || ""
        }`
      );
      doc.text(`${address.country || ""}`);
    }
    doc.text(`Tax ID: ${deliveryNote.user.company.taxId || ""}`);
    doc.text(`Email: ${deliveryNote.user.company.email || ""}`);
    doc.text(`Phone: ${deliveryNote.user.company.phone || ""}`);
  } else {
    doc.fontSize(12).text(`${deliveryNote.user.name}`);
    if (deliveryNote.user.personalInfo) {
      const info = deliveryNote.user.personalInfo;
      doc.text(`${info.address || ""}`);
      doc.text(`${info.city || ""}, ${info.postalCode || ""}`);
      doc.text(`${info.country || ""}`);
      doc.text(`Phone: ${info.phone || ""}`);
    }
    doc.text(`Email: ${deliveryNote.user.email}`);
  }
  doc.moveDown();

  // Información del cliente.s
  doc.fontSize(14).text("Client:", { underline: true });
  doc.fontSize(12).text(`${deliveryNote.client.name}`);
  if (deliveryNote.client.address) {
    const address = deliveryNote.client.address;
    doc.text(`${address.street || ""}`);
    doc.text(
      `${address.city || ""}, ${address.state || ""} ${
        address.postalCode || ""
      }`
    );
    doc.text(`${address.country || ""}`);
  }
  doc.text(`Tax ID: ${deliveryNote.client.taxId || ""}`);
  doc.text(`Email: ${deliveryNote.client.email || ""}`);
  doc.text(`Phone: ${deliveryNote.client.phone || ""}`);
  doc.moveDown();

  // Información del proyecto.
  doc.fontSize(14).text("Project:", { underline: true });
  doc.fontSize(12).text(`${deliveryNote.project.name}`);
  doc.text(`Description: ${deliveryNote.project.description || ""}`);
  doc.moveDown();

  // Se añade el trabajo.
  if (deliveryNote.labor && deliveryNote.labor.length > 0) {
    doc.fontSize(14).text("Labor:", { underline: true });

    // Creamos la tabla.
    doc.fontSize(10);
    const laborTableTop = doc.y;
    const laborTableWidth = 500;

    // Y definimos la anchura de las columnas.
    const personCol = 150;
    const hoursCol = 50;
    const rateCol = 80;
    const dateCol = 80;
    const descCol = 140;

    // Vamos escribiendo los datos en el pdf.
    doc.text("Person", doc.x, doc.y, { width: personCol, align: "left" });
    doc.text("Hours", doc.x + personCol, doc.y, {
      width: hoursCol,
      align: "right",
    });
    doc.text("Rate", doc.x + personCol + hoursCol, doc.y, {
      width: rateCol,
      align: "right",
    });
    doc.text("Date", doc.x + personCol + hoursCol + rateCol, doc.y, {
      width: dateCol,
      align: "left",
    });
    doc.text(
      "Description",
      doc.x + personCol + hoursCol + rateCol + dateCol,
      doc.y,
      { width: descCol, align: "left" }
    );
    doc.moveDown();

    // Esto dibuja una linea horizontal.
    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.x + laborTableWidth, doc.y)
      .stroke();

    // Y se dibujan las filas para cada item.
    let laborTotal = 0;

    deliveryNote.labor.forEach((item) => {
      const itemAmount = item.hours * (item.rate?.amount || 0);
      laborTotal += itemAmount;

      const rowY = doc.y;

      // Persona.
      doc.text(
        `${item.person.name}${
          item.person.role ? ` (${item.person.role})` : ""
        }`,
        doc.x,
        rowY,
        { width: personCol, align: "left" }
      );

      // Horas
      doc.text(`${item.hours}`, doc.x + personCol, rowY, {
        width: hoursCol,
        align: "right",
      });

      // Coste por hora.
      doc.text(
        `${item.rate?.amount || 0} ${item.rate?.currency || "EUR"}`,
        doc.x + personCol + hoursCol,
        rowY,
        { width: rateCol, align: "right" }
      );

      // Fecha
      doc.text(
        `${item.date ? new Date(item.date).toLocaleDateString() : ""}`,
        doc.x + personCol + hoursCol + rateCol,
        rowY,
        { width: dateCol, align: "left" }
      );

      // Descripción.
      doc.text(
        `${item.description || ""}`,
        doc.x + personCol + hoursCol + rateCol + dateCol,
        rowY,
        { width: descCol, align: "left" }
      );

      doc.moveDown();
    });

    // Dibujamos otra línea.
    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.x + laborTableWidth, doc.y)
      .stroke();

    // Y aquí añadimos el total de horas trabajadas.
    doc.text(
      `Labor Total: ${laborTotal} ${
        deliveryNote.labor[0]?.rate?.currency || "EUR"
      }`,
      { align: "right" }
    );
    doc.moveDown();
  }

  // Apartado de los materiales.
  if (deliveryNote.materials && deliveryNote.materials.length > 0) {
    doc.fontSize(14).text("Materials:", { underline: true });

    // Creamos la cabecera.
    doc.fontSize(10);
    const materialsTableTop = doc.y;
    const materialsTableWidth = 500;

    // Definimos la anchura de sus columnas.
    const nameCol = 150;
    const quantityCol = 60;
    const unitCol = 60;
    const priceCol = 100;
    const totalCol = 100;

    // Dibujamos la cabezera.
    doc.text("Material", doc.x, doc.y, { width: nameCol, align: "left" });
    doc.text("Quantity", doc.x + nameCol, doc.y, {
      width: quantityCol,
      align: "right",
    });
    doc.text("Unit", doc.x + nameCol + quantityCol, doc.y, {
      width: unitCol,
      align: "left",
    });
    doc.text("Price", doc.x + nameCol + quantityCol + unitCol, doc.y, {
      width: priceCol,
      align: "right",
    });
    doc.text(
      "Total",
      doc.x + nameCol + quantityCol + unitCol + priceCol,
      doc.y,
      { width: totalCol, align: "right" }
    );
    doc.moveDown();

    // Línea divisoria.
    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.x + materialsTableWidth, doc.y)
      .stroke();

    // Dibujamos las filas.
    let materialsTotal = 0;

    deliveryNote.materials.forEach((item) => {
      const itemTotal = item.quantity * (item.price?.amount || 0);
      materialsTotal += itemTotal;

      const rowY = doc.y;

      // Nombre
      doc.text(`${item.name}`, doc.x, rowY, { width: nameCol, align: "left" });

      // Cantidad.
      doc.text(`${item.quantity}`, doc.x + nameCol, rowY, {
        width: quantityCol,
        align: "right",
      });

      // Unidad
      doc.text(`${item.unit || "unit"}`, doc.x + nameCol + quantityCol, rowY, {
        width: unitCol,
        align: "left",
      });

      // Precio
      doc.text(
        `${item.price?.amount || 0} ${item.price?.currency || "EUR"}`,
        doc.x + nameCol + quantityCol + unitCol,
        rowY,
        { width: priceCol, align: "right" }
      );

      // Total
      doc.text(
        `${itemTotal} ${item.price?.currency || "EUR"}`,
        doc.x + nameCol + quantityCol + unitCol + priceCol,
        rowY,
        { width: totalCol, align: "right" }
      );

      doc.moveDown();
    });

    // Dibuja otra línea.
    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.x + materialsTableWidth, doc.y)
      .stroke();

    // Suma el total de los materiales.
    doc.text(
      `Materials Total: ${materialsTotal} ${
        deliveryNote.materials[0]?.price?.currency || "EUR"
      }`,
      { align: "right" }
    );
    doc.moveDown();
  }

  // Albaranes.
  if (deliveryNote.notes) {
    doc.fontSize(14).text("Notes:", { underline: true });
    doc.fontSize(12).text(deliveryNote.notes);
    doc.moveDown();
  }

  // Cantidad total.
  doc
    .fontSize(14)
    .text(
      `TOTAL: ${deliveryNote.totalAmount.amount} ${deliveryNote.totalAmount.currency}`,
      { align: "right" }
    );
  doc.moveDown();

  // Firma.
  if (deliveryNote.signatureImage) {
    doc.fontSize(14).text("Signature:", { underline: true });
    doc.moveDown();

    // Añadir la imágen de la firma.
    // TODO: obtener la imagen desde IPFS.
    doc.fontSize(12).text("Signed digitally", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Signed by: ${deliveryNote.signedBy}`);
    doc.text(`Date: ${new Date(deliveryNote.signedAt).toLocaleDateString()}`);
  } else {
    doc.fontSize(14).text("Signature:", { underline: true });
    doc.moveDown();

    doc.fontSize(12).text("_____________________________", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text("Name: ___________________________");
    doc.text("Date: ___________________________");
  }

  // Terminamos el documento.
  doc.end();

  // Pasamos al buffer.
  return Buffer.concat(chunks);
};

// Obtener el pdf de un documento.
const getDeliveryNotePdf = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { user } = req;

    // Lo obtiene por su id.
    const deliveryNote = await deliveryNoteModel.findById(id);

    if (!deliveryNote) {
      handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);
      return;
    }

    // Revisa si pertenece al usuario o su compañia.
    const isAuthorized =
      deliveryNote.user.toString() === user._id.toString() ||
      (user.company &&
        deliveryNote.company &&
        deliveryNote.company.toString() === user.company.toString());

    if (!isAuthorized) {
      handleHttpError(res, "NOT_AUTHORIZED_TO_ACCESS_DELIVERY_NOTE", 403);
      return;
    }

    // Revisa si no existe ya subido a IPFS.
    if (deliveryNote.pdfUrl) {
      // En ese caso les mandamos el otro url.
      return res.redirect(deliveryNote.pdfUrl);
    }

    // Generamos el pdf.
    const pdfBuffer = await generateDeliveryNotePdf(id);

    // Preparamos la cabecera para enviar un archivo.
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="delivery-note-${deliveryNote.number}.pdf"`
    );

    // Y lo enviamos.
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_GENERATE_DELIVERY_NOTE_PDF");
  }
};

module.exports = {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNote,
  updateDeliveryNote,
  deleteDeliveryNote,
  signDeliveryNote,
  getDeliveryNotePdf,
};
