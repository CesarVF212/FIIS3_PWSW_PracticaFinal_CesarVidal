// Junta todos los modelos para que se puedan importar de una vez.
module.exports = {
  userModel: require("./user"),
  companyModel: require("./company"),
  clientModel: require("./client"),
  projectModel: require("./project"),
  deliveryNoteModel: require("./deliveryNote"),
  invitationModel: require("./invitation"),
  storageModel: require("./storage"),
};
