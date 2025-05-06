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
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Antes de cada test limpiamos las colecciones.
beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
