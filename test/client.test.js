// --- PRUEBAS SOBRE EL CLIENTE --- //

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app").app; // Asegúrate de que exportas correctamente app desde app.js
const { userModel } = require("../models");
const { encrypt } = require("../utils/handlePassword");

// Test data con contraseña que cumpla con la validación
const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "Password.123", // Contraseña que cumple con la validación
};

let token;
let userId;

// Esta función permite manejar mejor las promesas en los tests
const asyncRequestHandler = async (request) => {
  try {
    return await request;
  } catch (error) {
    console.error("Error en la petición:", error);
    throw error;
  }
};

describe("Rutas del cliente", () => {
  let token;
  let userId;
  let clientId;

  // Creamos un usuario de prueba.
  beforeAll(async () => {
    // Hacemos que esté verificado.
    const password = await encrypt("Contraseña1234.");
    const user = await userModel.create({
      name: "Lucia Sierra",
      email: "lucia-sierra@gmail.com",
      password,
      verified: true,
    });

    userId = user._id;

    // Iniciamos sesión para obtener el token.
    const res = await request(app).post("/api/user/login").send({
      email: "lucia-sierra@gmail.com",
      password: "Contraseña1234.",
    });

    token = res.body.token;
  });

  // Test de Crear un cliente.
  describe("POST /api/client", () => {
    it("should create a new client", async () => {
      const clientData = {
        name: "Cliente de prueba",
        email: "cliente@gmail.com",
        phone: "+3434567890",
        contact: {
          name: "Alvarito",
          position: "Estudiante",
          email: "contacto-ejemplo@gmail.com",
          phone: "+3487654321",
        },
        address: {
          street: "Alameda de San Anton",
          city: "Cartagena",
          state: "Murcia",
          country: "Spain",
          postalCode: "30204",
        },
        nif: "B12345678",
        notes: "Enchufado por Pedro.",
      };

      const res = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send(clientData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(clientData.name);
      expect(res.body.email).toEqual(clientData.email);
      expect(res.body.user.toString()).toEqual(userId.toString());

      clientId = res.body._id;
    });

    it("Para el mismo usuario, no tener dos clientes con el mismo nombre", async () => {
      const clientData = {
        name: "Cliente de prueba",
        email: "cliente2@gmail.com",
      };

      const res = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send(clientData);

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty("error");
    });

    it("No se puede crear un cliente sin autentificación", async () => {
      const clientData = {
        name: "Cliente sin autentificación",
        email: "sin-autentificacion@gmail.com",
      };

      const res = await request(app).post("/api/client").send(clientData);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  // Prueba de obtener los clientes.
  describe("GET /api/client", () => {
    it("Obtiene todos los clientes de un usuario", async () => {
      const res = await request(app)
        .get("/api/client")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toEqual("Cliente de prueba");
    });

    it("No se pueden obtener los clientes sin autorizacion", async () => {
      const res = await request(app).get("/api/client");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  // Obtener un cliente por su id
  describe("GET /api/client/:id", () => {
    it("Se debe obtener un cliente por su ID", async () => {
      const res = await request(app)
        .get(`/api/client/${clientId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toEqual(clientId);
      expect(res.body.name).toEqual("Cliente de prueba");
    });

    it("No se puede obtener un cliente con un ID inválido", async () => {
      const res = await request(app)
        .get("/api/client/invalidid")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty("errors");
    });
  });

  // Prueba de actualizar un cliente
  describe("PUT /api/client/:id", () => {
    it("should update a client", async () => {
      const updateData = {
        name: "Cliente Actualizado",
        email: "cliente-actualizado@gmail.com",
        notes: "Nota actualizada",
      };

      const res = await request(app)
        .put(`/api/client/${clientId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(updateData.name);
      expect(res.body.email).toEqual(updateData.email);
      expect(res.body.notes).toEqual(updateData.notes);
    });
  });

  // Test para hacer un borrado lógico del cliente.
  describe("DELETE /api/client/:id/soft", () => {
    it("Debe de hacer borrado lógico de un cliente", async () => {
      const res = await request(app)
        .delete(`/api/client/${clientId}/soft`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message");

      // Revisar si el cliente está borrado lógicamente.
      const client = await clientModel.findById(clientId);
      expect(client).toBeNull(); // Debe de devolver nulo.

      const deletedClient = await clientModel.findOneDeleted({ _id: clientId });
      expect(deletedClient).not.toBeNull();
      expect(deletedClient._id.toString()).toEqual(clientId);
    });
  });

  // Test para obtener los clientes archivados.
  describe("GET /api/client/archived", () => {
    it("Debe obtener los clientes archivados.", async () => {
      const res = await request(app)
        .get("/api/client/archived")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]._id).toEqual(clientId);
    });
  });

  // Test para restaurar un cliente
  describe("POST /api/client/:id/restore", () => {
    it("should restore a soft-deleted client", async () => {
      const res = await request(app)
        .post(`/api/client/${clientId}/restore`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("client");
      expect(res.body.client._id).toEqual(clientId);

      // Revisa si se ha restaurado (anulado el borrado lógico)
      const client = await clientModel.findById(clientId);
      expect(client).not.toBeNull();
      expect(client._id.toString()).toEqual(clientId);
    });
  });

  // Prueba de borrado completo del cliente.
  describe("DELETE /api/client/:id", () => {
    it("should hard delete a client", async () => {
      const res = await request(app)
        .delete(`/api/client/${clientId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message");

      // Revisa si realmente se ha borrado.
      const client = await clientModel.findById(clientId);
      expect(client).toBeNull();

      const deletedClient = await clientModel.findOneDeleted({ _id: clientId });
      expect(deletedClient).toBeNull();
    });
  });
});
