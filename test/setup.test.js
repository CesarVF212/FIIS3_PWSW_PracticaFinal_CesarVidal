// --- PREPARA TODO PARA EL USO DE LOS TESTS --- //
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

// Creamos el servidor de test.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Y cogemos del .env las variables para el mismo.
  process.env.NODE_ENV = "test";
  process.env.DB_URI_TEST = mongoUri;
  process.env.JWT_SECRET = "test_secret_key";
  process.env.PUBLIC_URL = "http://localhost:3000";

  // Conectamos a la base de datos.
  await mongoose.connect(mongoUri);

  // Limpiamos completamente la base de datos antes de empezar
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Cerramos todas las conexiones
  await mongoose.connection.close();
  await mongoServer.stop();

  // Importante: esto ayuda a cerrar los handles abiertos
  setTimeout(() => process.exit(0), 1000);
});

// No es necesario el beforeEach si ya limpiamos todo en beforeAll
// Lo dejamos comentado por si lo necesitas luego
/*
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
*/
