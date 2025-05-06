// --- PRUEBAS SOBRE EL USUARIO --- //

const request = require("supertest");
const { app, server } = require("../app");
const { userModel } = require("../models");
const { encrypt } = require("../utils/handlePassword");

describe("User Routes", () => {
  let token;
  let userId;

  // Prueba de registro.
  describe("POST /api/user/register", () => {
    it("Debe registrar un nuevo usuario.", async () => {
      const res = await request(app).post("/api/user/register").send({
        name: "César Vidal Fernández",
        email: "cesar.vidal@live.u-tad.com",
        password: "Contrase@1234.",
      });

      // Marcamos la respuesta que se debe esperar.
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toEqual("test@example.com");
      expect(res.body.user.role).toEqual("user");
      expect(res.body.user).not.toHaveProperty("password");

      token = res.body.token;
      userId = res.body.user._id;
    });

    it("No debes de crear un usuario con un email ya existente.", async () => {
      const res = await request(app).post("/api/user/register").send({
        name: "Cesar Vidal Hernandez",
        email: "cesar.vidal@live.u-tad.com",
        password: "Contrase@1234.",
      });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty("error");
    });

    it("No puedes registrar un email con datos falsos.", async () => {
      const res = await request(app).post("/api/user/register").send({
        name: "Ignacio Cañizares",
        email: "cesar-vidal",
        password: "short",
      });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty("errors");
    });
  });

  // Prueba de verificación del email.
  describe("PUT /api/user/validation", () => {
    it("Se debe de validar el código del correo.", async () => {
      // Ponemos un código material ya que si no no lo vamos a poder introducir.
      const verificationCode = "123456";
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24);

      await userModel.findByIdAndUpdate(userId, {
        verificationCode,
        verificationExpires,
      });

      const res = await request(app)
        .put("/api/user/validation")
        .set("Authorization", `Bearer ${token}`)
        .send({ code: verificationCode });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message");

      // Mirar que el usuario esté verificado.
      const user = await userModel.findById(userId);
      expect(user.verified).toBe(true);
      expect(user.verificationCode).toBeNull();
    });

    it("No se debe de validar con el código incorrecto.", async () => {
      // Create another user for this test
      const password = await encrypt("Contra@1234.");
      const newUser = await userModel.create({
        name: "Pedro Perez",
        email: "pedro-perez@example.com",
        password,
        verificationCode: "654321",
        verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      // Intentamos obtener el token y obtener una respuesta correcta.
      const anotherToken = await request(app)
        .post("/api/user/login")
        .send({
          email: "anothertest@example.com",
          password: "Password@123.",
        })
        .then((res) => res.body.token);

      const res = await request(app)
        .put("/api/user/validation")
        .set("Authorization", `Bearer ${anotherToken}`)
        .send({ code: "wrong-code" });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  // Probar a iniciar sesión.
  describe("POST /api/user/login", () => {
    it("Se debe de inciciar sesión con los datos adecuados.", async () => {
      const res = await request(app).post("/api/user/login").send({
        email: "cesar.vidal@live.u-tad.com",
        password: "Contrase@1234.",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toEqual("test@example.com");
    });

    it("No se debe de poder iniciar sesión con información incorrecta.", async () => {
      const res = await request(app).post("/api/user/login").send({
        email: "cesar.vidal@live.u-tad.com",
        password: "Contrase@1234_incorrecto",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  // Probar a obtener el perfil.
  describe("GET /api/user", () => {
    it("Se debe de obtener un usuario con token valido", async () => {
      const res = await request(app)
        .get("/api/user")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toEqual(userId);
      expect(res.body.email).toEqual("cesar-vidal@live.u-tad.com");
      expect(res.body).not.toHaveProperty("Contrase@1234.");
    });

    it("No se debe de obtener un usuario con su token.", async () => {
      const res = await request(app).get("/api/user");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  // Test de actualizar un usuario.
  describe("PUT /api/user", () => {
    it("Debe de actualizar la información personal", async () => {
      const personalInfo = {
        firstName: "César",
        lastName: "Vidal",
        phone: "+34618772373",
        address: "Dulcinea 10",
        city: "Madrid",
        country: "Madrid",
        postalCode: "28020",
      };

      const res = await request(app)
        .put("/api/user")
        .set("Authorization", `Bearer ${token}`)
        .send({ personalInfo });

      expect(res.statusCode).toEqual(200);
      expect(res.body.personalInfo).toEqual(personalInfo);
    });
  });

  // Prueba a actualizar la compañia.s
  describe("PATCH /api/user/company", () => {
    it("Se debe de crear una empresa para el usuario.", async () => {
      // Verificamos primero el usuario.
      await userModel.findByIdAndUpdate(userId, {
        verified: true,
      });

      const companyData = {
        name: "Caesar Corp",
        legalName: "Caesar Corp S.L.U",
        nif: "A12345678",
        email: "info@caesarcorp.com",
        phone: "+34968507766",
        address: {
          street: "Avenida Séneca 8",
          city: "Madrid",
          state: "Madrid",
          country: "Spain",
          postalCode: "28040",
        },
        website: "https://www.google.es",
      };

      const res = await request(app)
        .patch("/api/user/company")
        .set("Authorization", `Bearer ${token}`)
        .send(companyData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(companyData.name);
      expect(res.body.legalName).toEqual(companyData.legalName);

      // Revisar si se tiene la referencia a la compañia.
      const updatedUser = await userModel.findById(userId);
      expect(updatedUser.company).not.toBeNull();
    });
  });
});
