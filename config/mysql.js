// --- CONFIGURACIÓN DE MYSQL --- //

const { Sequelize } = require("sequelize");

// Obtenemos los datos de la conexión a la base de datos desde el .env.
const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST;

// Creamos la conexión a la base de datos con Sequelize.
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect: "mysql",
});

// Configuramos y aseguramos la conexión a la base de datos.
const dbConnectMySql = async () => {
  try {
    await sequelize.authenticate();
    console.log("(config/mysql.js) Conexión a MYSQL establecida.");
  } catch (err) {
    console.error("(config/mysql.js) Conexión a MYSQL rechazada:\n", err);
  }
};

module.exports = { sequelize, dbConnectMySql };
