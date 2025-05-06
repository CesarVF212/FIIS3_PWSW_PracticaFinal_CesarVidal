// --- DEFINE LAS "CAPACIDADES" DE LA API Y COMO USARLA CON MOTIVOS DE DOCUMENTACIÓN --- //
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "CESO API",
      version: "1.0.0",
      description:
        "API desarrollada para la práctica final de asignatura de Programación Servidor del Doble Grado en Ingeniería de Software y Física Computacional.",
      contact: {
        name: "César Vidal Fernández.",
        email: "cesar.vidal@live.u-tad.com",
      },
    },
    servers: [
      {
        url: "/",
        description: "Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      // Define los diferentes modelos de datos de la API.
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
            role: { type: "string", enum: ["user", "admin", "guest"] },
            verified: { type: "boolean" },
            personalInfo: {
              type: "object",
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                phone: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                country: { type: "string" },
                postalCode: { type: "string" },
              },
            },
            company: { type: "string", format: "objectId" },
            profileImage: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Company: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            name: { type: "string" },
            legalName: { type: "string" },
            taxId: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                country: { type: "string" },
                postalCode: { type: "string" },
              },
            },
            logo: { type: "string" },
            website: { type: "string" },
            owner: { type: "string", format: "objectId" },
            members: {
              type: "array",
              items: { type: "string", format: "objectId" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Client: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            contact: {
              type: "object",
              properties: {
                name: { type: "string" },
                position: { type: "string" },
                email: { type: "string", format: "email" },
                phone: { type: "string" },
              },
            },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                country: { type: "string" },
                postalCode: { type: "string" },
              },
            },
            taxId: { type: "string" },
            notes: { type: "string" },
            user: { type: "string", format: "objectId" },
            company: { type: "string", format: "objectId" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Project: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            name: { type: "string" },
            description: { type: "string" },
            client: { type: "string", format: "objectId" },
            status: {
              type: "string",
              enum: ["active", "completed", "on-hold", "cancelled"],
            },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            budget: {
              type: "object",
              properties: {
                amount: { type: "number" },
                currency: { type: "string" },
              },
            },
            hourlyRate: {
              type: "object",
              properties: {
                amount: { type: "number" },
                currency: { type: "string" },
              },
            },
            user: { type: "string", format: "objectId" },
            company: { type: "string", format: "objectId" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        DeliveryNote: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            number: { type: "string" },
            date: { type: "string", format: "date-time" },
            project: { type: "string", format: "objectId" },
            client: { type: "string", format: "objectId" },
            user: { type: "string", format: "objectId" },
            company: { type: "string", format: "objectId" },
            labor: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  person: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      role: { type: "string" },
                    },
                  },
                  hours: { type: "number" },
                  rate: {
                    type: "object",
                    properties: {
                      amount: { type: "number" },
                      currency: { type: "string" },
                    },
                  },
                  date: { type: "string", format: "date-time" },
                  description: { type: "string" },
                },
              },
            },
            materials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  price: {
                    type: "object",
                    properties: {
                      amount: { type: "number" },
                      currency: { type: "string" },
                    },
                  },
                  description: { type: "string" },
                },
              },
            },
            notes: { type: "string" },
            totalAmount: {
              type: "object",
              properties: {
                amount: { type: "number" },
                currency: { type: "string" },
              },
            },
            status: {
              type: "string",
              enum: ["draft", "sent", "signed", "paid", "cancelled"],
            },
            signatureImage: { type: "string" },
            signedBy: { type: "string" },
            signedAt: { type: "string", format: "date-time" },
            pdfUrl: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Storage: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            url: { type: "string" },
            filename: { type: "string" },
            fileType: { type: "string", enum: ["image", "pdf", "signature"] },
            ipfsHash: { type: "string" },
            user: { type: "string", format: "objectId" },
            relatedTo: {
              type: "object",
              properties: {
                model: {
                  type: "string",
                  enum: [
                    "user",
                    "company",
                    "client",
                    "project",
                    "deliverynote",
                  ],
                },
                id: { type: "string", format: "objectId" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Invitation: {
          type: "object",
          properties: {
            _id: { type: "string", format: "objectId" },
            email: { type: "string", format: "email" },
            company: { type: "string", format: "objectId" },
            invitedBy: { type: "string", format: "objectId" },
            role: { type: "string", enum: ["user", "admin"] },
            token: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
            accepted: { type: "boolean" },
            acceptedAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Ruta a las apis.
};

module.exports = swaggerJsdoc(options);
